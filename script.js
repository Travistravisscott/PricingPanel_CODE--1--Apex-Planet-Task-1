let currentAccount;
let votingContract;

// Replace these with your contract's ABI and address
const contractABI = [
	{
		"inputs": [],
		"name": "announceWinner",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "voter",
				"type": "address"
			}
		],
		"name": "registerVoter",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string[]",
				"name": "proposalNames",
				"type": "string[]"
			},
			{
				"internalType": "uint256",
				"name": "votingTimeInMinutes",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "description",
				"type": "string"
			}
		],
		"name": "ProposalAdded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			}
		],
		"name": "Voted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "winningProposalId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "description",
				"type": "string"
			}
		],
		"name": "VotingResult",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "chairperson",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "proposals",
		"outputs": [
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "voteCount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "voters",
		"outputs": [
			{
				"internalType": "bool",
				"name": "isRegistered",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "hasVoted",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "vote",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "votingDeadline",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "winnerName",
		"outputs": [
			{
				"internalType": "string",
				"name": "winnerProposalDescription",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "winningProposal",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "winningProposalId",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const contractAddress = '0xa10752dfcce22c50e1093ec85272dfa2515f44ef';

// Load Web3
window.addEventListener('load', async () => {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.enable(); // Request account access
            await getCurrentAccount();
            initContract();
            loadProposals();
        } catch (error) {
            console.error("User denied account access", error);
        }
    } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
});

async function connectMetaMask() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            currentAccount = accounts[0];
            document.getElementById('currentAccount').innerText = `Connected account: ${currentAccount}`;
        } catch (error) {
            console.error("Error connecting MetaMask", error);
        }
    } else {
        alert('MetaMask is not installed. Please install it to use this app.');
    }
}

async function getCurrentAccount() {
    try {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            console.log('No accounts found. Please connect to MetaMask.');
        } else {
            currentAccount = accounts[0];
            document.getElementById('currentAccount').innerText = `Connected account: ${currentAccount}`;
        }
    } catch (error) {
        console.error("Error getting accounts", error);
    }
}

function initContract() {
    votingContract = new web3.eth.Contract(contractABI, contractAddress);
}

async function loadProposals() {
    try {
        const proposalCount = await votingContract.methods.getProposalCount().call();
        const proposalSelect = document.getElementById('proposalSelect');

        for (let i = 0; i < proposalCount; i++) {
            const proposal = await votingContract.methods.proposals(i).call();
            const option = document.createElement('option');
            option.value = i;
            option.text = proposal.description;
            proposalSelect.add(option);
        }
    } catch (error) {
        console.error("Error loading proposals", error);
    }
}

async function registerVoter() {
    const voterAddress = document.getElementById('voterAddress').value;

    try {
        await votingContract.methods.registerVoter(voterAddress).send({ from: currentAccount });
        alert(`Voter ${voterAddress} registered successfully.`);
    } catch (error) {
        console.error("Error registering voter", error);
    }
}

async function castVote() {
    const proposalId = document.getElementById('proposalSelect').value;

    try {
        await votingContract.methods.vote(proposalId).send({ from: currentAccount });
        alert(`Vote for proposal ${proposalId} cast successfully.`);
    } catch (error) {
        console.error("Error casting vote", error);
    }
}

async function announceWinner() {
    try {
        const winner = await votingContract.methods.winningProposal().call();
        document.getElementById('winner').innerText = `Winning Proposal: ${winner}`;
    } catch (error) {
        console.error("Error announcing winner", error);
    }
}
