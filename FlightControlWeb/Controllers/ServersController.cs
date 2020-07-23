using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FlightControlWeb.Model;
using Microsoft.AspNetCore.Mvc;

namespace FlightControlWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServersController : Controller
    {
        // GET: api/<controller>
        [HttpGet]
        public IEnumerable<Servers> GetServersList()
        {
            return DataBase.GetServersList();
        }

        // POST api/servers
        [HttpPost]
        public void Post([FromBody]Servers server)
        {
            server.ServerId = FlightPlan.CreateID();
            DataBase.AddServer(server);
        }

        // DELETE api/<controller>/5
        [HttpDelete("{id}")]
        public void Delete(string id)
        {
            DataBase.RemoveServer(id);
        }
    }
}
