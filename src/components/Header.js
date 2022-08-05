import React from 'react';
import { Menu, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

export default() => {
    return (
        <Menu stackable style ={{ marginTop: '75px'}}>
            <Button color = 'blue' as={Link} to = '/'>
                COMPRAR TOKENS LOT (NECESARIO PARA COMPRAR BOLETOS)
            </Button>
            <Button color = 'green' as={Link} to = '/loteria'>
                COMPRAR BOLETOS
            </Button>
            <Button color = 'orange' as={Link} to = '/premios'>
                CONSULTAR PREMIOS
            </Button>
            <Button color='linkedin' href = 'https://www.linkedin.com/in/adrian-dotel-pujols-192200208/'  icon='linkedin' >Linkedin</Button>
            <Button color='youtube' href = 'https://www.youtube.com/'  icon='youtube' >YouTube</Button>

        </Menu>
    );
}