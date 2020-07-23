const DEFAULT_SERVER_IP = 'localhost'
const DEFAULT_SERVER_PORT = '44336'
export const getServerURL = () => {
  const ip = localStorage.getItem('FlightControl_server_ip') || DEFAULT_SERVER_IP
  const port = localStorage.getItem('FlightControl_server_port') || DEFAULT_SERVER_PORT
  return `https://${ip}:${port}`
}

export const stringToDate = (string) => {
  const year = parseInt(string.slice(0, 4))
  const month = parseInt(string.slice(5, 7)) - 1
  const date = parseInt(string.slice(8, 10))
  const hours = parseInt(string.slice(11, 13))
  const minutes = parseInt(string.slice(14, 16))
  const seconds = parseInt(string.slice(17, 19))
  return new Date(Date.UTC(year, month, date, hours, minutes, seconds))
}

export const dateToString = (dateObject) => {
  const year = dateObject.getUTCFullYear().toString()
  const month = (dateObject.getUTCMonth() + 1).toString().padStart(2, '0')
  const date = dateObject.getUTCDate().toString().padStart(2, '0')
  const hours = dateObject.getUTCHours().toString().padStart(2, '0')
  const minutes = dateObject.getUTCMinutes().toString().padStart(2, '0')
  const seconds = dateObject.getUTCSeconds().toString().padStart(2, '0')
  return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}z`
}
