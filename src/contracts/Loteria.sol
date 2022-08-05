//SPDX-License-Identifier: MIT
pragma solidity >=0.4.4 <0.7.0;
pragma experimental ABIEncoderV2;
import "./ERC20.sol";

contract Loteria{

    //Instancia del contrato Token
    ERC20Basic private token;

    // Direcciones
    address public owner;
    address public contrato;
    address public direccion_ganador;

    // Numero de tokens
    uint public tokens_creados = 10000;

    // Evento compra de Tokens
    event ComprandoTokens(uint, address);

    constructor() public {
        token = new ERC20Basic(tokens_creados);
        owner = msg.sender;
        contrato = address(this);
    }

    // ------------------------------- TOKEN ----------------------------

    // Función que devuelve la dirección del Token LOT
    function DireccionToken() public view returns(address){
        return token.AddressContract();
    }
    
    // Funcion para calcular el precio del token, 1 LOT = 1 ETHER
    function PrecioToken(uint _numTokens) internal pure returns(uint){
        return _numTokens * (1 ether);
    }

    // Modificador solo el propietario
    modifier OnlyOwner(address _direccion){
        require(_direccion == owner, "No tienes acceso");
        _;
    }

    // Generar mas Tokens por la loteria
    function GeneraTokens(uint _numTokens) public OnlyOwner(msg.sender){
        token.increaseTotalSupply(_numTokens);
    }

    // Devuelve la cantidad de Tokens que tiene el contrato Loteria
    function TokensDisponibles() public view returns(uint){
       return token.balanceOf(contrato);
    }

    // Funcion para comprar Tokens para tener liquidez para los boletos
    function CompraTokens(uint _numTokens, address _propietario) public payable{
        // Cuantos ethers cuesta
        uint precioToken = PrecioToken(_numTokens);

        // Require que de suficientes ethers, y devolvemos el sobrante
        require (msg.value >= precioToken, "Ethers insuficientes");
        uint returnValue = msg.value - precioToken;
        // Quien hace el pago con ethers es la persona que llama a la funcion
        msg.sender.transfer(returnValue);

        // Cuantos tokens tiene el smart Contract
        require (_numTokens <= TokensDisponibles(), "No hay tokens suficientes");
        token.transfer(_propietario, _numTokens);

        emit ComprandoTokens(_numTokens, _propietario);

    }

    // Guardamos el bote en la direccion del propietario(owner), Osea todos los tokens que se estan jugando van a la wallet del owner
    function Bote() public view returns(uint){
        return token.balanceOf(owner);
    }

    // Funcion para ver cuantos tokens tiene una persona
    function MisTokens(address _direccion) public view returns(uint) {
        return token.balanceOf(_direccion);
    }


    // ------------------------------- LOTERIA ----------------------------

    // Saber el precio de boleto, en tokens LOT, osea 5 Ethers en total
    uint public PrecioBoleto = 5;

    // MAPPINGS
    // Relacion entre el usuario y los numeros que posee
    mapping (address => uint[]) idPersona_boletos;
    // Relacion para identificar al ganador
    mapping(uint => address) ADN_boleto;
    // Numero aleatorio
    uint randNonce = 0;
    // Boletos generados
    uint[] boletos_comprados;

    // EVENTOS
    event boleto_comprado(uint, address);
    event boleto_ganador(uint);
    event tokens_devueltos(uint, address);

    // Funcion para comprar boletos de loteria
    function CompraBoletos(uint _boletos) public{
        // Precio total de los boletos
        uint precio_total = _boletos * PrecioBoleto;
        // Filtrado de los tokens a pagar
        require (precio_total <= MisTokens(msg.sender), "Necesitas mas tokens");
        // Transferir los tokens que valen los boletos al owner, que es el bote
        token.transferencia_loteria(msg.sender, owner, precio_total);

        // Para generar el numero del boleto, cojemos el hash de
        // Now, la direccion del msg.sender, y el randNonce
        // Y cojemos los ultimos 4 digitos, numero aleatorio 0 >= 9999
        for(uint i = 0; i < _boletos; i++){
            uint random = uint(keccak256(abi.encodePacked(now, msg.sender, randNonce))) % 10000;
            randNonce++;

            // Almacenamos los boletos
            // En el mapping persona-> Boleto
            idPersona_boletos[msg.sender].push(random);
            // Y en los boletos en circulacion
            boletos_comprados.push(random);
            // Mapping Boleto-> Persona
            ADN_boleto[random] = msg.sender;

            emit boleto_comprado(random, msg.sender);
        }
    }

    // Funcion para ver los boletos comprados de una persona a través del mapping
    function TusBoletos() public view returns(uint[] memory){
        return idPersona_boletos[msg.sender];
    }

    // Funcion para generar un ganador aleatorio y darle los tokens
    function GenerarGanador() public OnlyOwner(msg.sender){
        // Que haya algun boleto
        require(boletos_comprados.length > 0, "No hay boletos comprados");
        // Declaracion del numero de boletos
        uint longitud = boletos_comprados.length;

        // Aleatoriamente se selecciona una posicion aleatorio de la array con el hash y el modulo de la longitud
        uint posicion_array = uint (uint(keccak256(abi.encodePacked(now))) % longitud);
        // Cojemos el numero del boleto desde la posicion
        uint eleccion = boletos_comprados[posicion_array];
        // Emitimos evento del ganador
        emit boleto_ganador(eleccion);
        // Recuperamos la direccion del ganador
        direccion_ganador = ADN_boleto[eleccion];
        // Enviamos los tokens para el ganador
        token.transferencia_loteria(msg.sender, direccion_ganador, Bote());
    }

    function DevolverTokens(uint _numTokens) public payable{
        // El numero de tokens tiene que ser positivo
        require(_numTokens > 0, "Tiene que ser un valor positivo");
        // El usuario tiene que tener los tokens
        require(_numTokens <= MisTokens(msg.sender), "No tienes tokens suficientes");
        // EL cliente devuelve los tokens al contrato
        // Se le paga los ethers desde el contrato al cliente
        // Se lo devolvemos al contrato, los tokens no van al bote(owner)
        token.transferencia_loteria(msg.sender, address(this), _numTokens);
        // Se le devuelve los ethers
        msg.sender.transfer(PrecioToken(_numTokens));
        // Emitimos evento
        emit tokens_devueltos(_numTokens, msg.sender);
    }

}