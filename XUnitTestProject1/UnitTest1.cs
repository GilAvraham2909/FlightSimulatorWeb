using FlightControlWeb.Controllers;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Assert = Microsoft.VisualStudio.TestTools.UnitTesting.Assert;
using FlightControlWeb.Model;
using FlightControlWeb;

namespace XUnitTestProject1
{
    public class UnitTest1
    {
        //test to check the Flightss
        private async Task<List<Flights>> ReturnFlightss()
        {
            List<Flights> list = await Task.Run(() => new List<Flights>());
            Flights f2 = new Flights
            {
                Flight_id = "02",
                Longitude = 20,
                Latitude = 20,
                Passengers = 102,
                Company_name = "its_a_Family",
                Date_time = "1923-12-26T23:56:21Z",
                Is_external = true

            };
            list.Add(f2);
            return list;
        }
        //the test to check all the Flightss appear
        [Fact]
        public void GetFlights_ShouldReturnFlightss()
        {
            {
                //add Flights plan to the db
                DataBase.flightPlanDB.Add("00", new FlightPlan
                {
                    Passengers = 400,
                    Company_Name = "Our_company",
                    Initial_location = new InitialLocation
                    {
                        Longitude = 90,
                        Latitude = 21,
                        Date_time = "2020-06-05T09:23:00Z"
                    },
                    Segments = new List<Segment>()
                    {
                        new Segment
                        {
                            Longitude = 20,
                            Latitude = 20,
                            Timespan_seconds=100
                        }
                    }
                });
                //the function from the FlightsController 
                Mock<FlightsController> controller = new Mock<FlightsController>();
                controller.Setup(x => x.flightsCheck(It.IsAny<string>()))
                    .Returns(ReturnFlightss());

                //ACT
                var listFlightss = 
                    controller.Object.GetFlightsByDateTimeForTest("2020-06-05T09:23:00Z").Result;

                //Assert
                    //check it is equal
                    Assert.AreEqual(listFlightss.Count, 1);
                    Assert.AreEqual(listFlightss[0].Passengers, 400);
                    Assert.AreEqual(listFlightss[0].Is_external, false);
                    Assert.AreEqual(listFlightss[0].Company_name, "Our_company");
                    Assert.AreEqual(listFlightss[0].Date_time, "2020-06-05T09:23:00Z");

                    //check it is not equal 
                    Assert.AreNotEqual(listFlightss.Count, 2);
                    Assert.AreNotEqual(listFlightss.Count, 3);
                    Assert.AreNotEqual(listFlightss[0].Passengers, 102);
                    Assert.AreNotEqual(listFlightss[0].Is_external, true);
                    Assert.AreNotEqual(listFlightss[0].Company_name, "Failier");
                }
            }
    }
}