import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Web3 from 'web3';
import './Upload.css';
import { useLocation } from 'react-router-dom';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  // Call useLocation at the top level
  const location = useLocation();
  const { email, password } = location.state || {}; // Destructure email and password from location.state

  const API_KEY = "f0c384f5eee6810aa146";
  const API_SECRET = "2d883da419c7c9dcbe463138e4d607dac97cfae88352a2c8a43447bd4731e3b8";
  const contractAddress = "0xbe4c2a461270d452e2ce2a298dbf05280cfb1267";
  const ABI =[
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
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWeb3(web3Instance);
        const contractInstance = new web3Instance.eth.Contract(ABI, contractAddress);
        setContract(contractInstance);
      } else {
        alert("Please install MetaMask to use this feature.");
      }
    };
    initWeb3();
  }, []);

  const checkUserExists = async () => {
    if (!email || !password) {
      setPopup({ type: 'error', message: 'Email or password is missing.' });
      return false;
    }
    const accounts = await web3.eth.getAccounts();
    try {
      const userExists = await contract.methods.checkUser(email, password).call({ from: accounts[0] });
      return userExists;
    } catch (error) {
      console.error("Error checking user existence:", error);
      setPopup({ type: 'error', message: 'Error checking user existence!' });
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setPopup({ type: 'error', message: 'No file selected!' });
      return;
    }

    const userExists = await checkUserExists();
    if (!userExists) {
      setPopup({ type: 'error', message: 'User does not exist. Please register first.' });
      return;
    }

    setLoading(true);
    setPopup(null);

    try {
      const fileData = new FormData();
      fileData.append("file", file);

      const response = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: fileData,
        headers: {
          pinata_api_key: API_KEY,
          pinata_secret_api_key: API_SECRET,
          "Content-Type": "multipart/form-data"
        }
      });

      const uploadedFileUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      setFileUrl(uploadedFileUrl);

      const accounts = await web3.eth.getAccounts();
      const gasEstimate = await contract.methods.uploadUserFile(uploadedFileUrl).estimateGas({ from: accounts[0] });
      await contract.methods.uploadUserFile(uploadedFileUrl).send({ from: accounts[0], gas: gasEstimate });

      setPopup({
        type: 'success',
        message: (
          <span>
            File uploaded and URL stored on blockchain successfully! View it <a href={uploadedFileUrl} target="_blank" rel="noopener noreferrer">here</a>.
          </span>
        ),
      });
    } catch (error) {
      console.error("Error uploading file or storing URL on blockchain:", error);
      setPopup({ type: 'error', message: 'Error uploading file or storing URL on blockchain!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="container">
        <h1>IPFS File Upload</h1>
        <form>
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files[0])} 
            name="file" 
            id="file" 
          />
          <button type="submit" name="Upload" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      {popup && (
        <div className={`popup ${popup.type}`}>
          <p>{popup.message}</p>
          <button onClick={() => setPopup(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Upload;
