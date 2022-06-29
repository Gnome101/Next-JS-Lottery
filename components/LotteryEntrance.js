import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { useMoralis, useMoralisSubscription } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotification, Button } from "web3uikit";
export default function LotteryEntrance() {
	const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
	const chainId = parseInt(chainIdHex);
	const raffleAddress =
		chainId in contractAddresses ? contractAddresses[chainId][0] : null;

	const [entranceFee, setEntranceFee] = useState("0");
	const [errorMessage, setErrorMessage] = useState("");
	const [numPlayers, setNumPlayer] = useState("0");
	const [recentWinner, setRecentWinner] = useState("0x0");

	async function updateUI() {
		const feeFromCall = (await getEntranceFee()).toString();
		const numPlayersCall = (await getNumberOfPlayers()).toString();
		const recentWinnerCall = (await getRecentWinner()).toString();
		setRecentWinner(recentWinnerCall);
		setNumPlayer(numPlayersCall);
		setEntranceFee(feeFromCall);
	}

	const dispatch = useNotification();
	const { runContractFunction: enterRaffle, isLoading } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: "enterRaffle",
		params: {},
		msgValue: entranceFee,
	});
	const { runContractFunction: getEntranceFee } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: "getEntranceFee",
		params: {},
	});
	const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: "getNumberOfPlayers",
		params: {},
	});
	const { runContractFunction: getRecentWinner } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: "getRecentWinner",
		params: {},
	});
	const handleNewNotification = () => {
		dispatch({
			type: "info",
			message: "Transaction Complete",
			title: "Tx Notification",
			position: "topR",
			icon: "bell",
		});
	};
	const handleSuccess = async (tx) => {
		await tx.wait(1);
		handleNewNotification(tx);
		updateUI();
	};

	useEffect(() => {
		if (isWeb3Enabled) {
			updateUI();
		}
	}, [isWeb3Enabled]);

	const filter = {
		address: raffleAddress,
	};
	return (
		<div>
			{raffleAddress ? (
				<div clasName="">
					<button
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
						onClick={async () => {
							setErrorMessage("");
							await enterRaffle({
								onSuccess: handleSuccess,
								onError: (error) => {
									console.log(error.message);
									setErrorMessage(error.message);
								},
							});
						}}
						disabled={isLoading}
					>
						{isLoading ? (
							<div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
						) : (
							<div>Enter Raffle</div>
						)}
					</button>
					Entrance Fee:
					{" " + ethers.utils.formatUnits(entranceFee, "ether")} ETH
					Players: {"" + numPlayers}
					Recent Winner: {" " + recentWinner}
					<div style={{ "padding-top": "10px" }}>
						{errorMessage ? (
							<Button
								color="red"
								id="test-button-status"
								onClick={function noRefCheck() {}}
								text={errorMessage}
								theme="status"
								type="button"
							/>
						) : (
							""
						)}
					</div>
				</div>
			) : (
				<div>
					No Raffle Address found, please connect to an accepted chain
				</div>
			)}
		</div>
	);
}
