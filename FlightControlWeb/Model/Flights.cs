using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FlightControlWeb.Model
{
    public class Flights
    {
        //attributes
        public string Flight_id { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double Passengers { get; set; }
        public string Company_name { get; set; }
        public string Date_time { get; set; }
        public bool Is_external { get; set; }
    }
}
