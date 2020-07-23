import React from "react"

import NotificationAlert from "react-notification-alert"

import Settings from './Settings'
import FlightsList from './FlightsList'
import FlightData from './FlightData'
import { getServerURL, dateToString } from 'utils'

// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
} from "reactstrap"

///////////////////////////////////////////////////////////////////////////////
// Enable icons with CRA
// https://github.com/PaulLeCam/react-leaflet/issues/453#issuecomment-410450387
import { Map, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})
///////////////////////////////////////////////////////////////////////////////

const SAMPLE_ELAPSE_TIME = 1000 // In MS


class Dashboard extends React.Component {
  constructor() {
    super()
    this.interval = null
  }

  state = {
    selectedFlightPlan: null,
    internalFlights: {},
    externalFlights: {},
    isSettingsModalOpen: false,
  }

  componentDidMount = () => {
    this.interval = setInterval(this.fetchFlightsData, SAMPLE_ELAPSE_TIME)
    document.body.addEventListener('click', (e) => {
      this.setState({selectedFlightPlan: null})
    })
  }

  componentWillUnmount = () => {
    clearInterval(this.interval)
  }

  getCurrentUtcTimeString = () => {
    const currentTime = new Date()
    return dateToString(currentTime)
  }

  fetchFlightsData = () => {
    fetch(`${getServerURL()}/api/Flights?relative_to=${this.getCurrentUtcTimeString()}`)
    .then(response => response.json())
    .then(data => {
      const internalFlights = {}
      const externalFlights = {}
      for (let flightData of data) {
        if (flightData.is_external) {
          externalFlights[flightData.flight_id] = flightData
        }
        else {
          internalFlights[flightData.flight_id] = flightData
        }
      }
      this.setState({internalFlights, externalFlights})
    })
    .catch((error) => {
      console.error('Error:', error)
      this.notify('danger', error.message)
    })
  }

  setSelectedFlightPlan = (newSelectedFlightPlan, flightId) => {
    this.setState({selectedFlightPlan: {...newSelectedFlightPlan, flight_id: flightId} })
  }

  setInternalFlights = (newInternalFlights) => {
    this.setState({internalFlights: newInternalFlights })
  }

  notify = (type, text) => {
    // Type is one of: info, success, danger, warning, primary
    const options = {
      place: 'tc',
      message: (
        <div>
          {text}
        </div>
      ),
      type: type,
      icon: "tim-icons icon-bell-55",
      autoDismiss: 5
    }
    try {
      // The content might not be loaded yet
      this.refs.notificationAlert.notificationAlert(options)
    }
    catch {
      console.error(`Failed to notify: ${text}`)
    }
  }

  render() {
    const position = [31.771959, 35.217018] // Jerusalem
    const iconSize = 36.0
    const selectedIcon = L.icon({
      iconUrl: require('assets/img/plane.png'),
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconSize / 2 , iconSize / 2],
      popupAnchor: [0, 0],
      shadowUrl: null,
      shadowSize: [0, 0],
      shadowAnchor: [0, 0]
    })
    const unselectedIcon = L.icon({
      iconUrl: require('assets/img/plane-unselected.png'),
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconSize / 2 , iconSize / 2],
      popupAnchor: [0, 0],
      shadowUrl: null,
      shadowSize: [0, 0],
      shadowAnchor: [0, 0]
    })

    const { internalFlights, externalFlights, selectedFlightPlan } = this.state

    const markers = []
    // Add unselected flights
    for (let flightId of Object.keys(internalFlights)) {
      if (selectedFlightPlan && flightId === selectedFlightPlan.flight_id){
        continue
      }
      const markerPosition = [
        internalFlights[flightId].latitude, internalFlights[flightId].longitude
      ]
      const companyName = internalFlights[flightId].company_name
      markers.push(
        <Marker 
          key={flightId} icon={unselectedIcon} position={markerPosition} 
          onClick={() => {
            // Fetch the new selected flight info
            fetch(`${getServerURL()}/api/FlightPlan/${flightId}`)
            .then(response => response.json())
            .then(data => {
              this.setSelectedFlightPlan(data, flightId)
            })
            .catch((error) => {
              console.error('Error:', error)
              this.notify('danger', error.message)
            })
          }}>
          <Popup>{`Flight #${flightId}`}<br />{companyName}</Popup>
        </Marker>
      )
    }
    // Add selected flight (if exist)
    let selectedFlight = null
    let pathSegments = []
    if (selectedFlightPlan) {
      const selectedFlightId = selectedFlightPlan.flight_id
      selectedFlight = internalFlights[selectedFlightId] || externalFlights[selectedFlightId]
      
      const markerPosition = [selectedFlight.latitude, selectedFlight.longitude]
      const companyName = selectedFlight.company_name

      markers.push(
        <Marker key={selectedFlightId} icon={selectedIcon} position={markerPosition} >
          <Popup>{`Flight #${selectedFlightId}`}<br />{companyName}</Popup>
        </Marker>
      )

      // Create marked path
      pathSegments.push([
        selectedFlightPlan.initial_location.latitude,
        selectedFlightPlan.initial_location.longitude
      ])
      for (let segment of selectedFlightPlan.segments) {
        pathSegments.push([segment.latitude, segment.longitude])
      }
    }

    return (
      <>
        <Settings 
          isOpen={this.state.isSettingsModalOpen}
          setIsOpen={(isOpen) => this.setState({isSettingsModalOpen: isOpen})}
         />
        <i className="fas fa-cog" 
          style={{position: 'absolute', 
                  fontSize: '2rem', 
                  top: '0.1em', 
                  right: '0.1em',
                  cursor: 'pointer'}}
          onClick={() => {
            this.setState({isSettingsModalOpen: true})
          }}
        ></i>
        <div className="content">
          <div className="react-notification-alert-container">
            <NotificationAlert ref="notificationAlert" />
          </div>
          <Row>

            <Col lg="8">
              {/* Map */}
              <Row>
                <Card className="card-chart">
                  <Map center={position} zoom={9} style={{ height: '65vh'}}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                    {markers}
                    <Polyline positions={pathSegments}/>
                  </Map>
                </Card>
              </Row>

              {/* Data */}
              <Row>

                {
                  selectedFlightPlan &&
                  <Card className="card-chart" style={{marginTop: '-1.5em'}}>
                    <CardHeader style={{padding: '0.5em 0.5em 0'}}>
                      <CardTitle style={{marginBottom: '0.2em'}} tag="h3">
                        <span style={{fontFamily: 'Helvetica'}}>
                          Flight <span style={{color: 'red'}}>{selectedFlightPlan.flight_id}</span>
                        </span>
                        <span style={{fontFamily: 'Helvetica'}}>
                           {` - ${selectedFlightPlan.company_name}`}
                        </span>
                        <span style={{fontFamily: 'Helvetica'}}>
                           {` - ${selectedFlightPlan.passengers} Passengers`}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardBody style={{padding: '1px 4px'}} >
                      {
                        selectedFlightPlan && 
                        <FlightData 
                          selectedFlightPlan={selectedFlightPlan}
                        />
                      }
                    </CardBody>
                  </Card>
                }
                
              </Row>
            </Col>

            {/* Flights List */}
            <Col lg="4">
              <Card className="card-chart">
                <CardBody style={{padding: '1px 10px'}}>
                  <FlightsList 
                    internalFlights={internalFlights} 
                    externalFlights={externalFlights}
                    selectedFlightId={selectedFlightPlan ? selectedFlightPlan.flight_id : null}
                    setSelectedFlightPlan={this.setSelectedFlightPlan}
                    setInternalFlights={this.setInternalFlights}
                    notify={this.notify}
                  />
                </CardBody>
              </Card>
            </Col>

          </Row>
        </div>
      </>
    )
  }
}

export default Dashboard
