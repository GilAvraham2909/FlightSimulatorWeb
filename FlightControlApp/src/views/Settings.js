import React from 'react'
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap'
import { InputGroup, InputGroupAddon, Input } from 'reactstrap'


const SettingsModal = ({isOpen, setIsOpen}) => {
  const toggle = () => setIsOpen(!isOpen)

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Settings</ModalHeader>
        <ModalBody>
            <InputGroup>
                <InputGroupAddon addonType="prepend">
                <Button style={{marginTop: 0, width: '7em'}}>IP</Button>
                </InputGroupAddon>
                <Input 
                    style={{height: '3.3em', color: 'black'}}
                    defaultValue={localStorage.getItem('FlightControl_server_ip')}
                    onBlur={(e) => {
                        localStorage.setItem('FlightControl_server_ip', e.target.value)
                    }}
                    />
            </InputGroup>
            <InputGroup>
                <InputGroupAddon addonType="prepend">
                <Button style={{marginTop: 0, width: '7em'}}>PORT</Button>
                </InputGroupAddon>
                <Input 
                    style={{height: '3.3em', color: 'black'}}
                    defaultValue={localStorage.getItem('FlightControl_server_port')}
                    onBlur={(e) => {
                        localStorage.setItem('FlightControl_server_port', e.target.value)
                    }}
                />
            </InputGroup>
        </ModalBody>
    </Modal>
  )
}

export default SettingsModal
