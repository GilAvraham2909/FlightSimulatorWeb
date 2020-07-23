import React from "react"

import { stringToDate, dateToString } from 'utils'

// reactstrap components
import { Table } from "reactstrap"


const FlightData = ({selectedFlightPlan}) => {
    const rowStyle = {paddingTop: '0.5em', paddingBottom: '0.5em'}
    const headerRowStyle = {paddingTop: '0.8em', paddingBottom: '0.8em'}
  
    const startLatitude = selectedFlightPlan.initial_location.latitude
    const startLongitude = selectedFlightPlan.initial_location.longitude
    const startLocation = `[${startLatitude}, ${startLongitude}]`
  
    const lastSegment = selectedFlightPlan.segments.slice().pop()
    const endLatitude = lastSegment.latitude
    const endLongitude = lastSegment.longitude
    const endLocation = `[${endLatitude}, ${endLongitude}]`
  
    const startTime = stringToDate(selectedFlightPlan.initial_location.date_time)
    let endTime = new Date(startTime.getTime())
    for (let segment of selectedFlightPlan.segments) {
      endTime.setSeconds(endTime.getSeconds() + segment.timespan_seconds)
    }
  
    return (
      <Table striped  size="sm" dark>
        <thead>
          <tr>
            <th style={headerRowStyle}>#</th>
            <th style={headerRowStyle}>Time</th>
            <th style={headerRowStyle}>Location</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={rowStyle}>Start</td>
            <td style={rowStyle}>{dateToString(startTime)}</td>
            <td style={rowStyle}>{startLocation}</td>
          </tr>
  
          <tr>
            <td style={rowStyle}>End</td>
            <td style={rowStyle}>{dateToString(endTime)}</td>
            <td style={rowStyle}>{endLocation}</td>
          </tr>
        </tbody>
      </Table>
    )
  }

  export default FlightData
