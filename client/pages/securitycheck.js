import { Autocomplete, Button, getNativeSelectUtilityClasses, Grid, IconButton, Typography } from "@mui/material";
import Colors from "../styles/colors";
import * as React from 'react';
import TextField from '@mui/material/TextField';
import SecurityCheckSVG from "../styles/securityCheckGraphic.svg";
import Image from "next/image";
import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { createTheme, ThemeProvider, styled } from "@mui/material/styles"
import theme from "../styles/theme.js"
import { ethers } from "ethers";

// FIXME: Refactor initialization into a different folder
const solidGuardManagerABI = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: '_dApp',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: '_pauses',
          type: 'uint256',
        },
      ],
      name: 'Deposit',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'previousOwner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'OwnershipTransferred',
      type: 'event',
    },
    {
      inputs: [
        {
          internalType: 'address[]',
          name: '_dApps',
          type: 'address[]',
        },
      ],
      name: 'batchPause',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address[]',
          name: '_dApps',
          type: 'address[]',
        },
        {
          internalType: 'uint256[]',
          name: '_pauses',
          type: 'uint256[]',
        },
      ],
      name: 'deposit',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_dApp',
          type: 'address',
        },
      ],
      name: 'getPauses',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'pauses',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'price',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'renounceOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'transferOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

let autocomplete = [];
let signature = "";
const solidGuardManager = new ethers.Contract(
    '0x05BA813eA8d76b1553f68A1b5dC942e71846adD9', // FIXME: Refactor into constants folder
    solidGuardManagerABI,
    ethers.getDefaultProvider(ethers.providers.getNetwork('rinkeby')), // FIXME: Refactor into constants folder
);

const PAUSE_ON_VULNERABILITY_RATE = 0.01;

const SecurityCheckPage = (props) => {
    const [addressList, setAddressList] = useState([]);
    const [currAddress, setCurrAddress] = useState("");
    const [currAddressId, setCurrAddressId] = useState(0);
    const [totalPauses, setTotalPauses] = useState(0);
    const [email, setEmail] = useState("");

    const SecurityCheckRow = (props) => {
        const [pauses, setPauses] = useState(0);

        return (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>

                <div style={{ width: '50%' }}>
                    <Button onClick={() => {
                        let newAddressList = [...addressList];
                        let selectedIndex = -1;
                        addressList.forEach((a, index) => { if (a.id === props.address.id) selectedIndex = index; return; })
                        newAddressList[selectedIndex].pauses++;
                        setAddressList(newAddressList);
                        setTotalPauses(totalPauses + 1);
                    }}>+</Button >
                    <Typography
                        variant="body"
                        align="left"
                        color={Colors.textLight}>
                        {props.address.pauses}
                    </Typography>
                    <Button onClick={() => {
                        if (props.address.pauses <= 0) return;

                        let newAddressList = [...addressList];
                        let selectedIndex = -1;
                        addressList.forEach((a, index) => { if (a.id === props.address.id) selectedIndex = index; return; })
                        newAddressList[selectedIndex].pauses--;
                        setAddressList(newAddressList);
                        setTotalPauses(totalPauses - 1);

                    }}>-</Button >
                </div>

                <div style={{ display: "flex", width: '50%', justifyContent: "flex-end", alignItems: "center" }}>
                    <Typography
                        variant="body"
                        align="left"
                        color={Colors.textLight}>
                        {props.address.address}
                    </Typography>

                    <IconButton
                        aria-label="close"
                        style={{ marginLeft: "auto" }}
                        variant="contained"
                        color="warning"
                        onClick={(event) => {
                            // necesscary to remove row before grid sets focus
                            setTimeout(() => {
                                setAddressList(addressList.filter(anAddress => anAddress.id !== props.address.id));
                                setTotalPauses(totalPauses - props.address.pauses);
                            });


                        }}>
                        <DeleteIcon />
                    </IconButton>
                </div>
            </div>
        )
    }

    const handleAddAddress = () => {
        if (!currAddress) return;
        let found = false;
        addressList.forEach(a => {
            if (a.address === currAddress) found = true;
            return;
        })
        if (found) return;

        const newAddress =
        {
            id: currAddressId,
            address: currAddress,
            pauses: 0,
        };

        let newList = [...addressList]
        let addresses = []
        newList.push(newAddress)
        addresses.push(newAddress.address);
        setAddressList(newList);
        console.log(addresses);
        setCurrAddressId(currAddressId + 1);

    }

    const fetchIds = async () => {

        const response = await fetch("http://localhost:3001/exploit/search?pageNo=1")
            .then(res => res.json())
            .then(data => {
                // FIXME: Populate autocomplete with contract addresses, not targetRef
                // data.data.forEach((attack) => {
                //     autocomplete.push({ label: attack.targetRef });
                // });
            });
    }

    // FIXME: Should connect to metamask first and foremost before performing the signing
    const connectMetamask = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum, ethers.providers.getNetwork('rinkeby'));
        window.ethereum.enable();
        const signer = provider.getSigner();
        signature = await signer.signMessage(JSON.stringify({contractAddrs: addressList.map(({address}) => address), emailAddrs: [email]}).replace(/\s+/g, ''))
        await subscribe();
        deposit(signer);
    }

    const subscribe = async () => {
        const subscribeBody = {
            contractAddrs: addressList.map(({address}) => address),
            emailAddrs: [email],
            signedJSON: signature,
        }
        console.log(subscribeBody)
        console.log(JSON.stringify(subscribeBody))
        const response = await fetch("http://localhost:3001/subscribe", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscribeBody)
        });

        if (response.status === 201) {
            response.json().then(data => {
                console.log(data);
            })
        } else {
            alert("Error");
        }
    }

    const deposit = async (ethSigner) => {
        const addrs = addressList.map(({address}) => address);
        const pauses = addressList.map(({pauses}) => pauses);
        console.log(addrs, pauses)
        await solidGuardManager.connect(ethSigner).deposit(addrs, pauses, {value: ethers.utils.parseEther((totalPauses * PAUSE_ON_VULNERABILITY_RATE).toString())});
    }

    React.useEffect(() => {
        fetchIds();
        console.log(autocomplete);
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <Grid container style={{ height: "95vh" }}>
                <Grid container item xs={7} justifyContent="center" alignItems="center" style={{ background: "linear-gradient(90deg, #FFA800 6.22%, #1B1B1B 94.98%)", height: "100%" }}>
                    <Image src={SecurityCheckSVG} />
                </Grid>

                <Grid container item xs={5} direction="column"
                    justifyContent="flex-start"
                    alignItems="flex-start" style={{ backgroundColor: "#1B1B1B" }}>

                    <div style={{ display: "flex", width: '100%' }}>


                        <div style={{ width: '50%' }}>
                            <Typography
                                variant="body1"
                                align="left"
                                color={Colors.textLight}
                                style={{ margin: '30px 20px 10px 20px', width: "90%" }}
                            >
                                Enter in your address to check company security
                            </Typography>

                            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                <Autocomplete
                                    disablePortal
                                    id="combo-box-demo"
                                    options={autocomplete}
                                    freeSolo
                                    sx={{ width: 300 }}
                                    renderInput={(params) => <TextField variant="filled" {...params} label="Addresses" />}
                                    style={{
                                        backgroundColor: "white", margin: 'auto 0 20px 20px',
                                        borderRadius: "20px",
                                        height: "50px",
                                        width: "80%",
                                    }}
                                    onInputChange={(e, v) => {
                                        setCurrAddress(v);
                                    }}
                                    variant="filled"
                                />
                                <IconButton aria-label="add"
                                    onClick={handleAddAddress}
                                >
                                    <AddCircleIcon style={{ color: Colors[1], height: "50px", width: "50px", marginBottom: "10px" }} />
                                </IconButton>
                            </div>

                        </div>

                        <div style={{ width: '50%', display: "flex", flexDirection: 'column' }}>


                            <Typography
                                variant="body1"
                                align="left"
                                color={Colors.textLight}
                                style={{ margin: '30px 20px 20px 20px', width: "90%" }}
                            >
                                Enter in your email address
                            </Typography>


                            <TextField id="filled-basic" label="Email" variant="filled" style={{
                                backgroundColor: Colors[5],
                                height: "50px",
                                width: "80%",
                                margin: 'auto 0 20px 20px',
                                borderRadius: "20px ",
                            }}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                }} />
                        </div>
                    </div>


                    <div style={{ height: '70%', width: '100%', marginTop: '30px' }}>
                        <div style={{ backgroundColor: "#333333", width: "90%", margin: "0 20px 0 20px", borderRadius: "20px 20px 0 0", overflow: "scroll" }}>
                            <div style={{ display: 'flex' }}>
                                <div style={{ display: "flex", width: '50%', justifyContent: "center" }}>

                                    <Typography
                                        variant="h6"
                                        align="left"
                                        color={Colors.textLight}
                                        style={{ margin: '10px 20px 0 20px', width: "90%" }}
                                    >
                                        Pause on Vulnerability
                                    </Typography>
                                </div>
                                <div style={{ display: "flex", width: '50%', justifyContent: "center" }}>

                                    <Typography
                                        variant="h6"
                                        align="left"
                                        color={Colors.textLight}
                                        style={{ margin: '10px 20px 0 20px', width: "90%" }}
                                    >
                                        Address
                                    </Typography>
                                </div>


                            </div>
                            <hr />
                        </div>
                        <div style={{ backgroundColor: "#333333", height: "60%", width: "90%", margin: "0 20px 20px 20px", borderRadius: "0 0 20px 20px", overflow: "scroll" }}>


                            {
                                addressList.map(address => {
                                    return (
                                        <SecurityCheckRow address={address} />
                                    )
                                })
                            }
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-start", marginLeft: 20 }}>
                            <Typography variant="body1" color="white">
                                Pause contract on vulnerability discovery? (will cost {totalPauses * PAUSE_ON_VULNERABILITY_RATE} ETH);
                            </Typography>
                        </div>


                        <Button
                            style={{
                                backgroundColor: Colors[1],
                                borderRadius: "10px",
                                height: "70px",
                                width: "90%",
                                marginLeft: "20px",
                                marginTop: "40px"
                            }}
                            onClick={() => connectMetamask()}
                            variant="contained"
                            color="primary"
                        >
                            <Typography variant="h6" color={Colors[3]}>
                                Submit
                            </Typography>
                        </Button>

                    </div>
                </Grid>
            </Grid >
        </ThemeProvider >
    )
}

export default SecurityCheckPage;