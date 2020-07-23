using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace FlightControlWeb.Model
{
    public class Servers
    {
        public string ServerId { get; set; }

        [JsonPropertyName("ServerURL")]
        public string ServerURL { get; set; }
    }
}
