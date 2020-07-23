import React, {useCallback} from "react"

import {
    Button,
    ListGroup,
    ListGroupItem,
  } from "reactstrap"
import {useDropzone} from 'react-dropzone'

import { getServerURL } from 'utils'


const FlightsList = ({
    internalFlights, externalFlights, 
    selectedFlightId, setSelectedFlightPlan, setInternalFlights, notify}) => {
  const onDrop = useCallback(acceptedFiles => {
    for (let file of acceptedFiles) {
      console.log('Received file')
      console.log(file)

      const fileExtension = file.name.split('.').pop()
      if (fileExtension.toLowerCase() !== 'json') {
        notify('danger', 'Only JSON Files Are Allowed')
        continue
      }

      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        const fileContent = reader.result
        // Post the file content to the server
        fetch(`${getServerURL()}/api/FlightPlan/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: fileContent,
        })
        .then(data => {
          console.log('Success: Added FlightPlan successfully')
          notify('success', 'Added Flight Plan Successfully')
        })
        .catch((error) => {
          console.error('Error:', error)
          notify('danger', error.message)
        })
      }
      reader.readAsText(file)
    }
  }, [])
  const {getRootProps, 
         getInputProps, 
         isDragActive} = useDropzone({onDrop, noClick: true})

  const internalFlightsItems = []
  for (let flightId of Object.keys(internalFlights)) {
    const { company_name } = internalFlights[flightId]
    internalFlightsItems.push(
      <ListGroupItem 
        active={selectedFlightId === flightId}
        onClick={(e) => {
          if (e.target.tagName === 'BUTTON') {
            e.preventDefault()
          }
          else {
            // Fetch the new selected flight info
            fetch(`${getServerURL()}/api/FlightPlan/${flightId}`)
            .then(response => response.json())
            .then(data => {
              setSelectedFlightPlan(data, flightId)
            })
            .catch((error) => {
              console.error('Error:', error)
              notify('danger', error.message)
            })
          }
        }}
        key={flightId} tag="a" href="#" action
      >
        {`Flight ${flightId}# - ${company_name}`}
        <Button
          color="danger" size="sm" style={{float: 'right'}}
          onClick={() => {
            // Delete the selected flight (send to the server)
            fetch(`${getServerURL()}/api/Flights/${flightId}`, {
              method: 'DELETE',
            })
            .then(data => {
              console.log(`Success: Deleted Flight ${flightId} Successfully`, data)
              notify('success', `Deleted Flight ${flightId} Successfully`)
              let newInternalFlights = {...internalFlights}
              delete newInternalFlights[flightId]
              setInternalFlights(newInternalFlights)
            })
            .catch((error) => {
              console.error('Error:', error)
              notify('danger', error.message)
            })
          }}
        >X</Button>
      </ListGroupItem>
    )
  }

  const externalFlightsItems = []
  for (let flightId of Object.keys(externalFlights)) {
    const { company_name } = externalFlights[flightId]
    externalFlightsItems.push(
      <ListGroupItem 
        onClick={(e) => {
          // Fetch the new selected flight info
          fetch(`${getServerURL()}/api/FlightPlan/${flightId}`)
          .then(response => response.json())
          .then(data => {
            setSelectedFlightPlan(data, flightId)
          })
          .catch((error) => {
            console.error('Error:', error)
            notify('danger', error.message)
          })
        }}
        key={flightId} tag="a" href="#" action
      >
        {`Flight ${flightId}# - ${company_name}`}
      </ListGroupItem>
    )
  }

  const flightsListStyle = {textTransform: 'uppercase', textAlign: 'center', margin: '0'}
 
  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {
        isDragActive 
          ?
          <div 
            style={
              {
                borderStyle: 'dashed',
                borderWidth: 'thick',
                height: '91.5vh', 
                backgroundImage: `url(${require('assets/img/dropzone.png')})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'contain'
              }
            }
          >
          </div>
          :
          <div>
            <h3 style={flightsListStyle}>Internals</h3>
            <ListGroup style={{height: '40vh', overflow: 'auto'}}>
              {internalFlightsItems}
            </ListGroup>
            <p />
            <h3 style={flightsListStyle}>Externals</h3>
            <ListGroup style={{height: '40vh', overflow: 'auto'}}>
              {externalFlightsItems}
            </ListGroup>
          </div>
      }
    </div>
  )
}

export default FlightsList
