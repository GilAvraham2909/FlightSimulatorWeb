using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using FlightControlWeb.Controllers;
using FlightControlWeb.Model;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace FlightControlWeb.Controllers
{
    public class ContactWithServers
    {
        public async Task<List<Flights>> GetAllFlight(string relative_to, bool isExtrnal)
        {
            List<Flights> flights = new List<Flights>();
            if (relative_to.Contains("UTC"))
            {
                relative_to = relative_to.Substring(0, relative_to.Length - 2);
                relative_to = relative_to.Replace('U', 'Z');
            }
            DateTime relativeDate = TimeZoneInfo.ConvertTimeToUtc(Convert.ToDateTime(relative_to));
            DateTime flightDate, lastFlightDate;
            List<Segment> flightSegments;
            // Go over all FlightPlans.
            foreach (FlightPlan flightPlan in DataBase.GetFlightPlansList())
            {
                lastFlightDate = TimeZoneInfo.ConvertTimeToUtc
                    (Convert.ToDateTime(flightPlan.Initial_location.Date_time));
                flightDate = TimeZoneInfo.ConvertTimeToUtc
                    (Convert.ToDateTime(flightPlan.Initial_location.Date_time));
                flightSegments = flightPlan.Segments;
                int j = 0;
                if (flightDate > relativeDate)
                {
                    // This Flight didnt started yet.
                    continue;
                }
                // Stop when we are in the segment or there are no more segments.
                while ((flightDate <= relativeDate) && (j < flightSegments.Count))
                {
                    lastFlightDate = flightDate;
                    // Each time- add the timespan seconds of the segments.
                    flightDate = flightDate.AddSeconds(flightSegments[j].Timespan_seconds);
                    j++;
                }
                // If we are in the segment (the flight didnt finished yet).
                if (flightDate >= relativeDate)
                {
                    // Add flight to list.
                    Flights flight =
                        this.CreateFlight(relativeDate, lastFlightDate, flightPlan, j, 
                        flightSegments);
                    flights.Add(flight);
                }
            }
            // If the user asked for external flights
            if (isExtrnal)
            {
                await RunExternalFlights(relative_to, flights);
            }
            return flights;
        }
        private Flights CreateFlight
            (DateTime relativeDate, DateTime lastFlightDate, FlightPlan flightPlan,
            int numSeg, List<Segment> flightSegments)
        {
            double longitude1 = 0, longitude2, latitude1 = 0, latitude2, longitude3, latitude3;
            double secoInSegment, timeRatio, distance, midDistance;
            // Find how much time passed from segment till now.
            secoInSegment = relativeDate.Subtract(lastFlightDate).TotalSeconds;
            // Find the time ratio.
            timeRatio = secoInSegment / flightSegments[numSeg - 1].Timespan_seconds;
            // Check if we are in the first segment.
            if (numSeg == 1)
            {
                // The last coordinate is from Initial_Location.
                longitude1 = flightPlan.Initial_location.Longitude;
                latitude1 = flightPlan.Initial_location.Latitude;
            }
            else
            {
                // The last coordinate is from last segment.
                longitude1 = flightSegments[numSeg - 2].Longitude;
                latitude1 = flightSegments[numSeg - 2].Latitude;
            }
            // The current segment's coordinates.
            longitude2 = flightSegments[numSeg - 1].Longitude;
            latitude2 = flightSegments[numSeg - 1].Latitude;
            // Linear interpolation
            distance = Math.Sqrt((Math.Pow(longitude2 - longitude1, 2)
                + Math.Pow(latitude2 - latitude1, 2)));
            midDistance = timeRatio * distance;
            latitude3 = latitude2 - ((midDistance) * (latitude2 - latitude1) / distance);
            longitude3 = longitude2 - ((midDistance) * (longitude2 - longitude1) / distance);
            // Create new Flight with the details we found.
            Flights flight = new Flights();
            flight.Longitude = longitude3;
            flight.Latitude = latitude3;
            flight.Flight_id = flightPlan.GetId();
            flight.Is_external = false;
            flight.Company_name = flightPlan.Company_Name;
            flight.Passengers = flightPlan.Passengers;
            flight.Date_time = flightPlan.Initial_location.Date_time;
            return flight;
        }
        private async Task<List<Flights>> RunExternalFlights
            (string relative_to, List<Flights> flights)
        {
            // Go over all servers
            foreach (Servers server in DataBase.GetServersList())
            {
                string request = server.ServerURL + "/api/Flights?relative_to=" + relative_to;
                List<Flights> serverFlights = await GetFlightsFromServer(request);
                // If the server has no FlightPlan in this relative time.
                if (serverFlights == null)
                {
                    continue;
                }
                // Go over all Flights.
                foreach (Flights flight in serverFlights)
                {
                    // Change this field to true.
                    flight.Is_external = true;
                }
                // Go over all Flights.
                foreach (Flights flight in flights)
                {
                    // Change this field to true.
                    flight.Is_external = true;
                }
                // Add them to list.
                flights.AddRange(serverFlights);
            }
            return flights;
        }
        protected async Task<List<Flights>> GetFlightsFromServer(string url)
        {
            string strResult = await SendRequestToServer(url);
            List<Flights> serverFlights;
            // Try to deserialize the jason to list of Flight.
            try
            {
                serverFlights = 
                    Newtonsoft.Json.JsonConvert.DeserializeObject<List<Flights>>(strResult);
            }
            catch
            {
                // If it failed- return null.
                return null;
            }
            return serverFlights;

        }
        protected async Task<string> SendRequestToServer(string url)
        {
            // Create the request.
            string strurl = string.Format(url);
            WebRequest requestObjGet = WebRequest.Create(strurl);
            requestObjGet.Method = "GET";
            HttpWebResponse responseObjGet = null;
            // Get the response from server.
            responseObjGet = (HttpWebResponse)await requestObjGet.GetResponseAsync();

            // Return response to string (json).
            string strResult = null;
            using (Stream stream = responseObjGet.GetResponseStream())
            {
                StreamReader sr = new StreamReader(stream);
                strResult = sr.ReadToEnd();
                sr.Close();
            }
            return strResult;
        }

        public async Task<FlightPlan> GetFlightPlanById(string id)
        {
            // Check if this flight is internal.
            if (DataBase.flightPlanDB.ContainsKey(id))
            {
                return DataBase.flightPlanDB[id];
            }
            // Go over all external servers.
            foreach (Servers server in DataBase.GetServersList())
            {
                // Send request to this server.
                string request = server.ServerURL + "/api/FlightPlan/" + id;
                FlightPlan serverFlightPlan = await GetFlightPlanFromServer(request);
                // Check if this flight exist in this server.
                if (serverFlightPlan.Company_Name != null)
                {
                    return serverFlightPlan;
                }
            }
            // There is no FlightPlan with this id (internal and external).
            return null;
        }

        private async Task<FlightPlan> GetFlightPlanFromServer(string url)
        {
            string strResult = await SendRequestToServer(url);
            // Deserialize the json to FlightPlan object.
            FlightPlan flightPlan = JsonConvert.DeserializeObject<FlightPlan>(strResult);
            return flightPlan;
        }
    }
}
