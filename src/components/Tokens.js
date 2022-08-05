import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import { Button, Icon } from 'semantic-ui-react';
import contrato_loteria from '../abis/Loteria.json';
import tokens from '../imagenes/tokens.png';

class Tokens extends Component {

    // Carga previa al render
    async componentWillMount() {
        
        // 1. Carga de WEB3
        await this.loadWeb3();
        // 2. Carga de los datos de la Blockchain
        await this.loadBlockchainData();

    }

    async loadWeb3() {

        // Si existe una ventana de Ethereum, creamos un objeto de Web3 y activamos la ventana de Ethereum
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
            comprador_tokens: "",
            cantidad: 0,
            balance_direccion: "",
            num_tokens: 0
        }
    }

    // FUNCION
    // COMPRAR TOKENS DE LA LOTERIA
    envio = async(wallet, cantidad, ethers) => {
        try {
            // Siempre que requerimos de guardar información en la Blockchain, cojemos la wallet que ha llamado a la función
            // Ya que guardar datos, tiene un coste, le cobramos a esa wallet el gas + costes de la propia función
            const web3 = window.web3; // Crear una ventana de web3 (Acceder a todas las funciones de la Web3)
            const accounts = await web3.eth.getAccounts(); // Usamos esta función para cojer la cuenta
            // Llamamos a la función con los parámetros de entrada, y desde la wallet accounts[0], y con los ethers que nos ha pasado
            await this.state.contract.methods.CompraTokens(cantidad, wallet).send({from: accounts[0], value: ethers});
            // Imprimimos el mensaje en la consola
            console.log('La cuenta: ', accounts[0], ' va a comprar ', cantidad, ' Tokens.');

        } catch(err) {
            this.setState({errorMessage: err.message});
        } finally {
            this.setState({loading: false});
        }
    }

    // FUNCION
    // CUANTOS TOKENS TIENE UNA WALLET
    balance_persona = async (direccion, mensaje) => {
        try {
            // Llamamos directamente a la función que es view, con la direccion que nos pasa por parámetro la función y imprimimos en pantalla
            const balance = await this.state.contract.methods.MisTokens(direccion).call();
            console.log(mensaje);
            alert(parseFloat(balance));

        } catch(err) {
            this.setState({errorMessage: err.message});
        } finally {
            this.setState({loading: false});
        }
    }

    // FUNCION
    // CUANTOS TOKENS QUEDAN EN EL CONTRATO
    balance_contrato = async (mensaje) => {
        try {
            // Llamamos a la función del Smart Contract TokensDisponibles y imprimimos el parámetro que devuelve
            const balance = await this.state.contract.methods.TokensDisponibles().call();
            console.log(mensaje);
            alert(balance);
            
        } catch(err) {
            this.setState({errorMessage: err.message});
        } finally {
            this.setState({loading: false});
        }
    }

    // FUNCION
    // AUMENTAR EL TOTALSUPPLY
    incremento_tokens = async (num_tokens ,mensaje) => {
        try {
            // Cojemos la wallet que llama a la función a través de la ventana de Web3, donde se le cobrará el gas
            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();
            // Llamamos a la funcion GeneraTokens desde ella, con el parámetro de entrada
            await this.state.contract.methods.GeneraTokens(num_tokens).send({from: accounts[0]});
            console.log(mensaje);
            
        } catch(err) {
            this.setState({errorMessage: err.message});
        } finally {
            this.setState({loading: false});
        }
    }

    contrato_token = async () => {
        try {
            const direccion_contrato = await this.state.contract.methods.DireccionToken().call();
            alert(direccion_contrato);
            
        } catch(err) {
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
                      <h2>Token LOT (Precio 1 Eth)</h2>

                      <a href="http://www.google.com"
                      target = "_blank"
                      rel = "noopener noreferrer">
                          <p></p>
                          <img src= {tokens} width = "450" height = "400" alt = ""/>
                      </a>
                      <p></p>

                      <h3> <Icon circular inverted color='red' name='dollar' /> Comprar Tokens LOT</h3>

                      <form onSubmit = {(event) => {
                        event.preventDefault();
                        const comprador_tokens = this.comprador_tokens.value;
                        const cantidad = this.cantidad.value;
                        // Abrimos una ventana de Web3 para poder calcular cuantos wei son lo que le pasamos, y le decimos que los convierta a ethers
                        const web3 = window.web3;
                        const ethers = web3.utils.toWei(this.cantidad.value, 'ether');
                        // Llamamos a la función después de haber cojido todos los parámetros
                        this.envio(comprador_tokens, cantidad, ethers);
                        }
                       }>

                       <input type = "text"
                            className = "form-control mb-1"
                            placeholder = "Wallet destino:"
                            ref = {(input) => this.comprador_tokens = input} />

                        <input type = "text"
                            className = "form-control mb-1"
                            placeholder = "Nº tokens a comprar: "
                            ref = {(input) => this.cantidad = input} />

                        <input type = "submit"
                            className = "bbtn btn-block btn-danger btn-sm"
                            value = "COMPRAR LOT" />

                        </form>

                        <h3><Icon circular inverted color='orange' name='bitcoin' />Balance de LOT de una Wallet</h3>

                        <form onSubmit = {(event) => {
                        event.preventDefault();
                        const balance_direccion = this.balance_direccion.value;
                        const mensaje = 'viendo el balance de la wallet...';
                        this.balance_persona(balance_direccion, mensaje);
                        }
                       }>

                       <input type = "text"
                            className = "form-control mb-1"
                            placeholder = "Dirección a observar:"
                            ref = {(input) => this.balance_direccion = input} />

                        <input type = "submit"
                            className = "bbtn btn-block btn-warning btn-sm"
                            value = "VER BALANCE" />

                        </form>

                        <h3><Icon circular inverted color='green' name='chart line' />Balance restante de LOT del Smart Contract</h3>

                        <form onSubmit = {(event) => {
                        event.preventDefault();
                        const mensaje = 'Balance Smart Contract...';
                        this.balance_contrato(mensaje);
                        }
                       }>

                        <input type = "submit"
                            className = "bbtn btn-block btn-success btn-sm"
                            value = "VER BALANCE SMART CONTRACT" />

                        </form>
                    
                       <h3><Icon circular inverted color='blue' name='ethereum' /> Ampliar Total Supply</h3>

                        <form onSubmit = {(event) => {
                        event.preventDefault();
                        const mensaje = 'Aumentando Total Supply...';
                        const num_tokens = this.num_tokens.value;
                        this.incremento_tokens(num_tokens, mensaje);
                        }
                       }>

                        <input type = "text"
                            className = "form-control mb-1"
                            placeholder = "Nº a incrementar"
                            ref = {(input) => this.num_tokens = input} />

                        <input type = "submit"
                            className = "bbtn btn-block btn-primary btn-sm"
                            value = "AUMENTAR TOTAL SUPPLY" />

                        </form>

                        <h3><Icon circular inverted color='black' name='chart line' /> Direccion de LOT para añadirlo a tu METAMASK!</h3>

                        <form onSubmit = {(event) => {
                        event.preventDefault();
                        this.contrato_token();
                        }}>

                        <input type = "submit"
                            className = "bbtn btn-block btn-dark btn-sm"
                            value = "MOSTRAR DIRECCION" />

                        </form>

                       &nbsp;
                   

                  </div> 
                </main>
              </div> 
            </div> 
            </div>
        );
    }

}

export default Tokens;