import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './FetchUserData.css';

const FetchUserData = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  // Define contract ABI and address
  const contractAddress = "0xbe4c2a461270d452e2ce2a298dbf05280cfb1267"; // replace with your contract address
    const ABI = [
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "orgId",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "password",
                    "type": "string"
                }
            ],
            "name": "registerOrganization",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "username",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "email",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "password",
                    "type": "string"
                }
            ],
            "name": "registerUser",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "url",
                    "type": "string"
                }
            ],
            "name": "uploadOrganizationFile",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "url",
                    "type": "string"
                }
            ],
            "name": "uploadUserFile",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "orgId",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "password",
                    "type": "string"
                }
            ],
            "name": "checkOrganization",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "email",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "password",
                    "type": "string"
                }
            ],
            "name": "checkUser",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getOrganizationData",
            "outputs": [
                {
                    "internalType": "string[]",
                    "name": "",
                    "type": "string[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getUserData",
            "outputs": [
                {
                    "internalType": "string[]",
                    "name": "",
                    "type": "string[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

  useEffect(() => {
    // Initialize Web3 and the contract
    async function initWeb3() {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWeb3(web3Instance);
        const contractInstance = new web3Instance.eth.Contract(ABI, contractAddress);
        setContract(contractInstance);
      } else {
        alert("Please install MetaMask to use this feature.");
      }
    }

    initWeb3();
  }, []);

  // Function to fetch user data from the blockchain
  const fetchUserData = async () => {
    setLoading(true);
    setPopup(null); // Reset popup before starting the fetch

    try {
      const accounts = await web3.eth.getAccounts();
      const data = await contract.methods.getUserData().call({ from: accounts[0] });

      if (data && data.length > 0) {
        setUserData(data);
      } else {
        setPopup({ type: 'error', message: 'No data found for this user.' });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setPopup({ type: 'error', message: 'Error fetching user data!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fetch-user-data-container">
      <h1>Fetch User Data</h1>
      
      <button onClick={fetchUserData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>

      {popup && (
        <div className={`popup ${popup.type}`}>
          <p>{popup.message}</p>
          <button onClick={() => setPopup(null)}>Close</button>
        </div>
      )}

      {userData.length > 0 && (
        <div>
          <h2>Your Data:</h2>
          <ul>
            {userData.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FetchUserData;
