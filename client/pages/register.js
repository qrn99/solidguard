
import { Autocomplete, Button, Grid, IconButton, InputLabel, Input, Typography } from "@mui/material";
import Colors from "../styles/colors";
import * as React from 'react';
import TextField from '@mui/material/TextField';
import SecurityCheckSVG from "../styles/securityCheckGraphic.svg";
import Image from "next/image";
import { useState } from 'react';

import { createTheme, ThemeProvider, styled } from "@mui/material/styles"
import theme from "../styles/theme.js"
import { FormControl } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import { PinDropSharp } from "@material-ui/icons";

let registerBody = {};

const SignInField = (props) => {
    return (
        <div style={{ width: "100%" }}>
            <Typography
                variant="h6"
                align="left"
                color={Colors.textLight}>
                * {props.field}
            </Typography>
            <TextField
                id="filled-basic"
                variant="filled"
                style={{ margin: '10px 0 10% 0', backgroundColor: Colors[5], borderRadius: '10px', width: "100%" }}
                onChange={(e) => {
                    registerBody[props.label] = e.target.value;
                }}
            />
        </div>
    )
}


const SignInPage = () => {

    const [password, setPassword] = useState("");

    const signIn = async () => {
        console.log(registerBody);

        const response = await fetch("http://localhost:3001/user/register", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerBody)
        });

        if (response.status === 201) {
            alert("created");
            response.json().then(data => {
                console.log(data);
            })
        } else {
            alert("Error");
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <Grid container style={{ height: "95vh" }}>
                <Grid container item xs={7} justifyContent="center" alignItems="center" style={{ background: "linear-gradient(90deg, #000000 6.22%, #003748 94.98%)", height: "100%" }}>
                    <Image src={SecurityCheckSVG} />
                </Grid>

                <Grid container item xs={5} direction="column" alignItems="center" style={{ background: Colors[4], padding: '8% 8% 0 8%' }}>
                    <div style={{ width: "100%", display: 'flex', flexDirection: "column", justifyContent: "flex-start" }}>

                        <Typography
                            variant="h2"
                            align="left"
                            color={Colors.textLight}
                            style={{ marginBottom: '12%' }}
                        >
                            <b>REGISTER</b>
                        </Typography>


                        <SignInField field="Email Address" label="email" />
                        <SignInField field="Create a Password" label="password" />
                        <div style={{ width: "100%" }}>
                            <Typography
                                variant="h6"
                                align="left"
                                color={Colors.textLight}>
                                * Re-Enter Password
                            </Typography>
                            <TextField
                                id="filled-basic"
                                variant="filled"
                                style={{ margin: '10px 0 10% 0', backgroundColor: Colors[5], borderRadius: '10px', width: "100%" }}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                }}
                            />
                        </div>



                        <Button variant="contained" onClick={() => {
                            if (password !== registerBody.password) {
                                alert("Passwords don't match")
                            } else {
                                console.log(signIn());
                            }
                        }}>
                            Create Account
                        </Button>
                    </div>
                </Grid>

            </Grid >
        </ThemeProvider >
    )
}

export default SignInPage;