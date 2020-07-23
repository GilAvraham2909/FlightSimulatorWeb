using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlightControlWeb.Model
{
    public class FlightPlan
    {
        private string Id;

        public string GetId()
        {
            return Id;
        }

        public void SetId()
        {
            Id = CreateID();
        }

        [JsonPropertyName("passengers")]
        public int Passengers { get; set; }

        [JsonPropertyName("company_name")]
        public string Company_Name { get; set; }

        [JsonPropertyName("initial_location")]
        public InitialLocation Initial_location { get; set; }

        [NotMapped]
        [JsonPropertyName("segments")]
        public List<Segment> Segments { get; set; }

        public static string CreateID()
        {
            string id = "";
            Random rand = new Random();
            //smull letter Case
            id += Convert.ToChar(rand.Next(65, 91));
            id += Convert.ToChar(rand.Next(65, 91));
            //big letter Case
            id += Convert.ToChar(rand.Next(97, 123));
            id += Convert.ToChar(rand.Next(97, 123));
            //3 numbers 
            id += rand.Next(0, 9);
            id += rand.Next(0, 9);
            id += rand.Next(0, 9);
            return id;
        }
    }
}
