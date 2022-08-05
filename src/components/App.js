import React, { Component } from 'react';
import './App.css';
import { Container } from 'semantic-ui-react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import Header from './Header';
import Tokens from './Tokens';
import Loteria from './Loteria';
import Premios from './Premios';


// CLASE PRINCIPAL SE LLAMA APP
// RENDERIZA LA PÁGINA Y LLAMA A LOS OTROS COMPONENTES

class App extends Component {
  
    render(){
      return(
        <BrowserRouter>
          <Container>
            <Header />
              <main>
                  <Switch>
                    <Route exact path="/" component={Tokens}/>
                    <Route exact path="/loteria" component={Loteria}/>
                    <Route exact path="/premios" component={Premios}/>
                  </Switch>
              </main>
          </Container>
        </BrowserRouter>
      );
    }
}

export default App;
