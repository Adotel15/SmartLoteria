import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import contrato_loteria from '../abis/Loteria.json';
import { Icon } from 'semantic-ui-react';
import tokens from '../imagenes/loteria.png';

class Loteria extends Component {

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
            boletos_comprados: 0
        }
    }

    bote = async(mensaje) => {
        try {

            console.log(mensaje);
            const bote_loteria = await this.state.contract.methods.Bote().call();
            alert(parseFloat(bote_loteria));

        } catch(err){
            this.setState({errorMessage: err.message});
        } finally {
            this.setState({loading: false});
        }
    }

    precio_boleto = async(mensaje) => {
        try {

            console.log(mensaje);
            const Precio = await this.state.contract.methods.PrecioBoleto().call();
            alert(parseFloat(Precio));

        } catch(err){
            this.setState({errorMessage: err.message});
        } finally {
            this.setState({loading: false});
        }
    }

    compra_boleto = async(boletos_comprados, mensaje) => {
        try {

            console.log(mensaje);

            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();

            await this.state.contract.methods.CompraBoletos(boletos_comprados).send({from: accounts[0]});
            alert("Mucha suerte!");

        } catch(err){
            this.setState({errorMessage: err.message});
        } finally {
            this.setState({loading: false});
        }
    }

    render () {
        return(
            <div>
            <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
              <a className="navbar-brand col-sm-3 col-md-2 mr-0 text-white">LOTERIA</a>
              <ul className = "navbar-nav px-3">
                <li className = "nav-item text-nowrap d-none d-sm-none d-sm-block">
                  <small className = 'text-white'> <span id = 'account'> Cuenta Activa: {this.state.account} </span></small>
                </li>
              </ul>
            </nav>
            <div className="container-fluid mt-5">
              <div className="row">
                <main role="main" className="col-lg-12 d-flex text-center">
                  <div className="content mr-auto ml-auto">

                      <h1>¡JUEGA LA MEJOR LOTERÍA DEL MUNDO CRYPTO!</h1>
                      <h2>Gestión y control de Boletos</h2>

                      <a href="http://www.google.com"
                      target = "_blank"
                      rel = "noopener noreferrer">
                          <p></p>
                          <img src= {tokens} width = "550" height = "320" alt = ""/>
                      </a>
                      <p></p>

                      <h3><Icon circular inverted color='red' name='money bill alternate' />Bote</h3>

                        <form onSubmit = {(event) => {
                        event.preventDefault();
                        const mensaje = 'Viendo Bote actual';
                        this.bote(mensaje);
                        }}>

                        <input type = "submit"
                            className = "bbtn btn-block btn-danger btn-sm"
                            value = "VER BOTE" />

                        </form>

                        <h3><Icon circular inverted color='orange' name='money bill alternate' />Precio por Boleto</h3>

                        <form onSubmit = {(event) => {
                        event.preventDefault();
                        const mensaje = 'Viendo precio por boleto...';
                        this.precio_boleto(mensaje);
                        }}>

                        <input type = "submit"
                            className = "bbtn btn-block btn-warning btn-sm"
                            value = "VER BOTE" />

                        </form>

                        <h3><Icon circular inverted color='green' name='payment' />Comprar Boletos</h3>

                        <form onSubmit = {(event) => {
                        event.preventDefault();
                        const boletos_comprados = this.boletos_comprados.value;
                        const mensaje = 'Comprando boletos...';
                        this.compra_boleto(boletos_comprados, mensaje);
                        }}>
                        
                        {/* ASI ES COMO SE COMENTA EN REACT */}

                        <input type = "text"
                            className = "form-control mb-1"
                            placeholder = "Nº de boletos a comprar"
                            ref = {(input) => this.boletos_comprados = input} />

                        <input type = "submit"
                            className = "bbtn btn-block btn-success btn-sm"
                            value = "COMPRAR BOLETOS" />

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

export default Loteria;