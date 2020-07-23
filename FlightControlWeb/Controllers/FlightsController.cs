using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using FlightControlWeb.Model;
using Microsoft.AspNetCore.Mvc;

namespace FlightControlWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FlightsController : Controller
    {
        private ContactWithServers contact = new ContactWithServers();

        // DELETE api/flight/5
        [HttpDelete("{id}")]
        public void Delete(string id)
        {
            DataBase.RemoveFlight(id);
        }

        //GET: api/Flights
        [HttpGet]
        public async Task<IEnumerable<Flights>> GetFlightsByDateTime(string relative_to)
        {
            string request = Request.QueryString.Value;
            //cheek if its all flight or just internal flights
            bool External = request.Contains("sync_all");
            Task<List<Flights>> currentFlights = contact.GetAllFlight(relative_to, External);
            return await currentFlights;
        }
       
        public async Task<List<Flights>> GetFlightsByDateTimeForTest(string relative_to)
        {
            Task<List<Flights>> flights1 = flightsCheck(relative_to);
            Task<List<Flights>> currentFlights = contact.GetAllFlight(relative_to, false);
            return await currentFlights;
        }
        public virtual Task<List<Flights>> flightsCheck(string time)
        {
            return contact.GetAllFlight(time, false);
        }
    }
}
