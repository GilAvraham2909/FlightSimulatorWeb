using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FlightControlWeb.Model;

namespace FlightControlWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FlightPlanController : Controller
    {
        private ContactWithServers contact = new ContactWithServers();

        // GET: api/FlightPlan/5
        [HttpGet("{id}")]
        public async Task<FlightPlan> GetFlightPlanById(string id)
        {
            return await contact.GetFlightPlanById(id);
        }

        // POST api/<controller>
        [HttpPost]
        public void Post([FromBody]FlightPlan flightPlan)
        {
            flightPlan.SetId();
            DataBase.AddFlightPlan(flightPlan);
        }
    }
}
