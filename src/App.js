import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Web3 from 'web3';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
  }

  getAuthHeader() {
    console.log(`localStorage.getItem('jwt') === ${localStorage.getItem('jwt')}`);
    return { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` };
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();

      const loginUrl = 'http://localhost:8000/api/login'
      const protectedUrl = 'http://localhost:8000/api/secret';

      const chainId = window.web3.currentProvider.networkVersion;
      const ethAddress = window.web3.utils.toChecksumAddress(
        window.web3.currentProvider.selectedAddress
      );

      console.log(`ethAddress === ${ethAddress}`);

      //this request will fail because we are not authenticated
      const protectedOptions1 = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      };
      await fetch(protectedUrl, protectedOptions1).then(response => {
        console.log(`response from protectedUrl === ${JSON.stringify(response.json())}`);
      });


      // Retrieve the nonce from GET /api/login
      let authMsg;
      const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      };
      const searchParams = new URLSearchParams({ ethAddress });

      await fetch(loginUrl + '?' + searchParams, requestOptions)
        .then(response => response.json())
        .then(data => authMsg = data.result.authMsg);

      authMsg.domain.chainId = chainId;
      console.log(`authMsg === ${authMsg}`);

      // now have the client sign the message through MetaMask
      const signature = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [ethAddress, JSON.stringify(authMsg)],
      });

      // here's the signature
      console.log(`signature === ${signature}`);


      // Now that the user has signed the message send it to the BE
      // along with the ethAddress, chainId, and signature.
      // A jwt token will be returned in the result. Store this
      // in localStorage and set it as a header whenever making a request.
      // Refer to getAuthHeader function.
      const postRequestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature, ethAddress, chainId })
      };
      await fetch(loginUrl, postRequestOptions)
        .then(response => response.json())
        .then(data => {
          localStorage.setItem('jwt', data.result.token);
          console.log(`apiMember === ${JSON.stringify(data.result.apiMember)}`);
        });


      const protectedOptions2 = {
        method: 'GET',
        headers: Object.assign(
          { 'Content-Type': 'application/json' },
          this.getAuthHeader()),  // setting JWT token in header
      };

      // this request should succeed because we are providing a valid JWT token.
      // to log the user out just delete the jwt token from localStorage.
      await fetch(protectedUrl, protectedOptions2)
        .then(response => response.json())
        .then(data => {
          console.log('successfully authenticated')
          console.log(data)
        });


    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    console.log('successfully authed');
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
      </div>
    );
  }

}

export default App;
