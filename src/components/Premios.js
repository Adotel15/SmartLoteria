import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import contrato_loteria from '../abis/Loteria.json';
import { Icon } from 'semantic-ui-react';
import tokens from '../imagenes/winner.png';

class Premios extends Component {

    // Carga previa al render
    async componentWillMount() {
        
        // 1. Carga de WEB3
        await this.loadWeb3();
        // 2. Carga de los datos de la Blockchain
        await this.loadBlockchainData();

    }

    async loadWeb3() {

        // Si existe una ventana de Ethereum, creamos un objeto de Web3 y activamos la ventanda de Ethereum
        if(window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        }

        // Si no existe una ventana de Ethereum pero hay una ventana de WEB3, creamos el objeto de web3 con la wallet que haya
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        }

        // Si no hay nada sacamos la alerta
        else {
            window.alert('No hay ninguna wallet conectada');
        }
    }

    async loadBlockchainData() {
        
        // Cojemos la ventana de web3 en la variable
        const web3 = window.web3;

        // Cojemos la wallet
        const accounts = await web3.eth.getAccounts();
        this.setState({account: accounts[0]});
        console.log('Cuenta conecntada: ', this.state.account);

        // Identificador de la blockchain
        const network_id = '5777'; // Gananche -> 5777, Rinkeby -> 4, BSC -> 97
        console.log('networkId: ', network_id);

        // Datos desde el json
        const networkData = contrato_loteria.networks[network_id];
        console.log('Informacion de la red: ', networkData);

        if(networkData) {

            const abi = contrato_loteria.abi;
            console.log('abi: ', abi);

            const address = networkData.address;
            console.log('Direccion: ', address);

            const contract = new web3.eth.Contract(abi, address);
            this.setState({contract});

        } else {

            window.alert('No se ha desplegado el contrato');
        }
    }

    constructor(props) {

        super(props);
        this.state = {
            contract: null,
            loading: false,
            errorMessage: "",
            account: "",
            tokens_devolver: 0
        }
    }

    // Función para Generar un Ganador
    ganador = async (mensaje) => {
        try {
            console.log(mensaje);
            // Cojemos la cuenta
            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();
            // Llamamos a la función del contrato desde la cuenta recogida, tiene que ser el Owner sino no dejará pasar
            await this.state.contract.methods.GenerarGanador().send({from: accounts[0]});

        } catch(err) {
            this.setState({errorMessage: err.message});
        } finally {
            this.setState({loading: false});
        }
    }

    // Función para ver el ganador
    ver_ganador = async(mensaje) => {
        try {
            console.log(mensaje);
            // Simplemente creamos una variable donde guardar la direccion devuelva el getter de la variable de la dirección en el contrato
            const direccion = await this.state.contract.methods.direccion_ganador().call();
            // Imprimimos la dirección con un alert
            alert(direccion);

        } catch(err) {
            this.setState({errorMessage: err.message});
        } finally {
            this.setState({loading: false});
        }
    }

    // Función para devolver los tokens a ethers, parámetro de entrada el número de Tokens Lot a devolver
    devolver_tokens = async(devolucion_tokens, mensaje) => {
        try {
            console.log(mensaje);
            // Cojemos la cuenta que esta llamando a la función
            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();
            // Llamamos a la función en en cuestión, y se le procedera a la devolución de ethers
            await this.state.contract.methods.DevolverTokens(devolucion_tokens).send({from: accounts[0]});

        } catch(err) {
            this.setState({errorMessage: err.message});
        } finally {
            this.setState({loading: false});
        }
    }



    render () {
        return(
            <div>
            {/*ESTE ES EL CÓDIGO DE LA CABECERA NEGRA DONDE SE PONE ARRIBA A LA IZQUIERA LOTERIA, Y LA CUENTA ACTIVA */}
            <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
              <a className="navbar-brand col-sm-3 col-md-2 mr-0 text-white">LOTERIA</a>
              <ul className = "navbar-nav px-3">
                <li className = "nav-item text-nowrap d-none d-sm-none d-sm-block">
                  <small className = 'text-white'> <span id = 'account'> Cuenta Activa: {this.state.account} </span></small>
                </li>
              </ul>
            </nav>

            {/*ESTE ES EL TÍTULO PRÓPIAMENTE DICHO DE CADA PÁGINA DEL SWITCH, SIEMPRE SERÁ PRIMERO LOTERÍA CON TOKENS ERC-20, Y LUEGO LA COSA QUE HAGA LA PESTAÑITA EN CUESTIÓN */}
            <div className="container-fluid mt-5">
              <div className="row">
                <main role="main" className="col-lg-12 d-flex text-center">
                  <div className="content mr-auto ml-auto">

                    <h1>¡JUEGA LA MEJOR LOTERÍA DEL MUNDO CRYPTO!</h1>
                    <h2>Ganador de la Loteria!</h2>

                    {/*IMAGEN QUE AL CLICKARSE LLEVA A GOOGLE*/}

                    <a href="http://www.google.com"
                    target = "_blank"
                    rel = "noopener noreferrer">
                    <p></p>
                    <img src= {tokens} width = "400" height = "400" alt = ""/>
                    </a>
                    <p></p>

                    {/*A PARTIR DE AQUÍ EMPIEZAN LOS HN CON CADA UNO DE LOS COMPONENTES PARA LLAMAR A LAS FUNCIONES DEL SMART CONTRACT, CON LOS PARÁMETROS QUE NECESITEN PARA EJECUTARSE */}

                    <h3><Icon circular inverted color='red' name='winner' />Generar Ganador</h3>

                    <form onSubmit = {(event) => {
                    event.preventDefault();
                    const mensaje = 'Generando Ganador de la lotería!';
                    this.ganador(mensaje);
                    }}>

                    <input type = "submit"
                        className = "bbtn btn-block btn-danger btn-sm"
                        value = "GENERAR GANADOR" />

                    </form>

                    <h3><Icon circular inverted color='orange' name='winner' />Ver Ganador</h3>

                    <form onSubmit = {(event) => {
                    event.preventDefault();
                    const mensaje = 'Viendo la dirección del ganador';
                    this.ver_ganador(mensaje);
                    }}>

                    <input type = "submit"
                        className = "bbtn btn-block btn-warning btn-sm"
                        value = "VER GANADOR" />

                    </form>

                    <h3><Icon circular inverted color='green' name='winner' />Devolver Tokens</h3>

                    <form onSubmit = {(event) => {
                        event.preventDefault();
                        const tokens_devolver = this.tokens_devolver.value;
                        const mensaje = 'Devolviendo tokens';
                        this.devolver_tokens(tokens_devolver, mensaje);
                        }
                       }>

                       <input type = "text"
                            className = "form-control mb-1"
                            placeholder = "Nº de Tokens a devolver"
                            ref = {(input) => this.tokens_devolver = input} />

                        <input type = "submit"
                            className = "bbtn btn-block btn-success btn-sm"
                            value = "DEVOLVER TOKENS" />

                        </form>

                        &nbsp;

                      </div> 
                </main>
              </div> 
            </div> 
            </div>
           
        )
    }

}

export default Premios;