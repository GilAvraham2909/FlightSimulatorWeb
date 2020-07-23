using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FlightControlWeb.Model;

namespace FlightControlWeb
{
    public class DataBase
    {
        //my DataBase
        public static Dictionary<string, FlightPlan> flightPlanDB =
            new Dictionary<string, FlightPlan>();
        public static Dictionary<string, Servers> serverDB = new Dictionary<string, Servers>();

        public static void AddFlightPlan(FlightPlan flightPlan)
        {
            flightPlanDB.TryAdd(flightPlan.GetId(), flightPlan);
        }

        public static void RemoveFlight(string flightId)
        {
            flightPlanDB.Remove(flightId);
        }

        public static FlightPlan GetFlighPlantById(string id)
        {
            if (flightPlanDB.ContainsKey(id))
            {
                return flightPlanDB.GetValueOrDefault(id);
            }
            return null;
        }

        public static void AddServer(Servers server)
        {
            serverDB.TryAdd(server.ServerId, server);
        }

        public static void RemoveServer(string id)
        {
            serverDB.Remove(id);
        }

        public static List<Servers> GetServersList()
        {
            List<Servers> serverList = new List<Servers>();
            foreach (KeyValuePair<string, Servers> currentServer in serverDB)
            {
                serverList.Add(currentServer.Value);
            }
            return serverList;
        }

        public static List<FlightPlan> GetFlightPlansList()
        {
            List<FlightPlan> flighPlantList = new List<FlightPlan>();
            foreach (KeyValuePair<string, FlightPlan> currentFlight in flightPlanDB)
            {
                flighPlantList.Add(currentFlight.Value);
            }
            return flighPlantList;
        }

        public void temp()
        {

        }
    }
}