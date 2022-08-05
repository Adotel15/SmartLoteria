//SPDX-License-Identifier: MIT
pragma solidity >=0.4.4 <0.7.0;
pragma experimental ABIEncoderV2;
import "./SafeMath.sol";


interface ERC20
{
    // Devuelve la cantidad de tokens total en circulación
    function totalSupply() external view returns(uint256);

    // Cantidad de tokens de una wallet
    function balanceOf(address account) external view returns(uint256);

    // Devuelve el número de tokens que el spender puede gastar en nombre del propietario
    function allowance(address owner, address spender) external view returns(uint256);

    // El msg.sender envia a recipient el amount de su propia cantidad total
    function transfer(address recipient, uint256 amount) external returns(bool);

    // Funcion especial para el contrato de la Loteria, el emisor enviar el recipient el numero de tokens
    function transferencia_loteria(address emisor, address recipient, uint256 _numTokens) external returns(bool);

    // El msg.sender aprueba al spender gastar la cantidad de amount
    function approve(address spender, uint256 amount) external returns(bool);

    // El sender
    function transferFrom(address sender, address recipient, uint256 amount) external returns(bool);



    //Evento cuando haya una transacción
    event Transfer(address indexed from, address indexed to, uint256 value);

    //Evento cuando se haya aprobado un allowance de que una direccion puede gastar tokens de un propietario
    event Approval(address indexed owner, address indexed spender, uint256 value);
}


//Implementacion de las ERC20
contract ERC20Basic is ERC20
{

    string public constant name = "TokenLoteria";
    string public constant symbol = "LOT";
    uint8 public constant decimals = 0;
    address public smart_contract;

    mapping(address => uint) balances;

    mapping(address => mapping(address => uint)) allowed;

    uint256 totalSupply_;

    constructor(uint256 _initialSupply) public{
        totalSupply_ = _initialSupply;
        balances[msg.sender] = totalSupply_;
        smart_contract = address(this);
    }

    event Transfer(address indexed from, address indexed to, uint256 tokens);
    event Approval(address indexed owner, address indexed spender, uint256 tokens);

    using SafeMath for uint256;

    function AddressContract() public view returns(address){
        return smart_contract;
    }


    function totalSupply() public override view returns(uint256){
        return totalSupply_;
    }

    function increaseTotalSupply(uint _newTokensAmount) public{
        totalSupply_ += _newTokensAmount;
        balances[msg.sender] += _newTokensAmount;
    }

    function balanceOf(address _tokenOwner) public override view returns(uint256){
        return balances[_tokenOwner];
    }

    function allowance(address owner, address delegate) public override view returns(uint256){
        return allowed[owner][delegate];
    }

    function transfer(address recipient, uint256 _numTokens) public override returns(bool){
        require(_numTokens <= balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender].sub(_numTokens);
        balances[recipient] = balances[recipient].add(_numTokens);

        emit Transfer(msg.sender, recipient, _numTokens);
        return true;
    }

      function transferencia_loteria(address emisor, address recipient, uint256 _numTokens) public override returns(bool){
        require(_numTokens <= balances[emisor]);
        balances[emisor] = balances[emisor].sub(_numTokens);
        balances[recipient] = balances[recipient].add(_numTokens);

        emit Transfer(emisor, recipient, _numTokens);
        return true;
    }


    function approve(address _delegate, uint256 _numTokens) public override returns(bool){
        require(_numTokens <= balances[msg.sender]);
        allowed[msg.sender][_delegate] = _numTokens;

        emit Approval(msg.sender, _delegate, _numTokens);
        return true;

    }

    function transferFrom(address owner, address buyer, uint256 _numTokens) public override returns(bool){
        require(_numTokens <= balances[owner]);
        require(_numTokens <= allowed[owner][msg.sender]);

        balances[owner] = balances[owner].sub(_numTokens);
        allowed[owner][msg.sender] = allowed[owner][msg.sender].sub(_numTokens);
        balances[buyer] = balances[buyer].add(_numTokens);

        emit Transfer(owner, buyer, _numTokens);
        return true;
    }

}