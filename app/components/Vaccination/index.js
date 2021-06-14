//https://github.com/Musawirkhann/react_qrcode_generation_scanner/blob/main/src/App.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  makeStyles,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
} from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import { withStyles } from "@material-ui/core/styles";
// import QRCode from 'qrcode';
// import QrReader from "react-qr-reader";
import axios from "axios";
import QRCodeData from "react-qr-code";
import socketIOClient from "socket.io-client";
import PropTypes from "prop-types";
const ENDPOINT = "http://localhost:4000";

const useStyles = makeStyles((theme) => ({
  conatiner: {
    marginTop: 10,
    marginBottom: 10,
    width: 10000,
    height: 10000,
  },
  title: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#3f51b5",
    color: "#fff",
    padding: 10,
  },
  btn: {
    marginTop: 10,
    marginBottom: 20,
  },
  root: {
    width: "100%",
  },
  root2: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "25ch",
    },
  },
  button: {
    marginTop: theme.spacing(0),
    marginRight: theme.spacing(0),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  verboseContainer: {
    padding: theme.spacing(1),
  },
}));

const IOSSwitch = withStyles((theme) => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    padding: 1,
    "&$checked": {
      transform: "translateX(16px)",
      color: theme.palette.common.white,
      "& + $track": {
        backgroundColor: "#52d869",
        opacity: 1,
        border: "none",
      },
    },
    "&$focusVisible $thumb": {
      color: "#52d869",
      border: "6px solid #fff",
    },
  },
  thumb: {
    width: 24,
    height: 24,
  },
  track: {
    borderRadius: 26 / 2,
    border: `0px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[50],
    opacity: 1,
    transition: theme.transitions.create(["background-color", "border"]),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

function App() {
  const classes = useStyles();
  const [qrCodeData, setQrCodeData] = useState(false);
  const [verboseMode, setVerboseMode] = useToggle();
  // const [verboseMode, setVerboseMode] = useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [relationshipDid, setRelationshipDid] = useState(0);
  // const [proofRequestStatus, setProofRequestStatus] = useState(false);
  const steps = getSteps();
  const [state, setState] = React.useState({ checkedB: false });
  const [response, setResponse] = useState("");
  const [messages, setMessages] = useState([]);
  const [connectionAccepted, setConnectionAccepted] = useState(false);
  const [proofAccepted, setProofAccepted] = useState(false); ////
  const [proofRejected, setProofRejected] = useState(false);
  const [passengerData, setPassengerData] = useState({});

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
    setVerboseMode(true);
    setQrCodeData(null);
  };

  function useToggle(initialValue = false) {
    const [value, setValue] = React.useState(initialValue);
    const toggle = React.useCallback(() => {
      setValue((v) => !v);
    }, []);
    return [value, toggle];
  }

  useEffect(() => {
    //The socket is a module that exports the actual socket.io socket
    const socket = socketIOClient(ENDPOINT);

    socket.on('connect', () => {
      // either with send()
      socket.send('Hello!');
      console.log('socket connected ', socket.id);
      socket.on('disconnect', () => {
        console.log('Socket Disconnected');
        // onDisconnect();
      });
    });
    
    setMessages([]);
    socket.on("FromAPI", (data) => {
      // console.log('socket1: ', data)
      setResponse(data);
      console.log("Socket: ", socket.id);
    });

    const addMessage = (msg) => setMessages((messages) => [...messages, msg]);

    socket.on("chatMessage", (data) => {
      console.log("addMessage:", data);

      if (messages.includes("inviteURL")) {
        console.log("invitie url found");
      }
      addMessage(data);
    });

    socket.on("qrScanned", (data) => {
      console.log("qrScanned:", data);
      setConnectionAccepted(true);
    });
    socket.on("proofAccepted", (data) => {
      console.log("Proof Accepted:", data);
      setPassengerData(data);
      setProofAccepted(true);
      console.log(data);
    });
    socket.on("proofRejected", (data) => {
      console.log("Proof Rejected:", data);
      setProofRejected(true);
    });
    console.log("Verbose Mode: ", verboseMode);
    return () => {
      socket.disconnect();
    };
  }, [verboseMode]);

  const generateQrCode = async () => {
    axios
      .get("http://localhost:4000/invite-url")
      .then(function (response) {
        // handle success
        // console.log(response.data.inviteURL);
        setQrCodeData(response.data.inviteURL);
        setRelationshipDid(response.data.relationshipDid);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        // always executed
      });
  };
  const proofRequest = async () => {
    console.log("relationshipDid:", relationshipDid);
    // setProofRequestStatus(true);
    axios
      .get("http://localhost:4000/request-proof", {
        params: {
          relationshipDid: relationshipDid,
        },
      })
      .then(function (response) {
        // handle success
        console.log(relationshipDid);
        // setProofRequestStatus(true);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        // always executed
      });
  };
  // const handleErrorFile = (error) => {
  //   console.log(error);
  // };
  // const handleScanFile = (result) => {
  //   if (result) {
  //     setScanResultFile(result);
  //   }
  // };
  // const onScanFile = () => {
  //   qrRef.current.openImageDialog();
  // };
  // const handleErrorWebCam = (error) => {
  //   console.log(error);
  // };
  // const handleScanWebCam = (result) => {
  //   if (result) {
  //     setScanResultWebCam(result);
  //   }
  // };

  function getSteps() {
    return [
      "Establish DID Connection",
      "Send Vaccination Proof Request",
      // "Prompt Passenger to Share Attributes",
    ];
  }

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            {/* <Grid item xl={4} lg={4} md={6} sm={12} xs={12}> */}
            <Grid item>
              <Button
                className={classes.btn}
                variant="contained"
                color="primary"
                onClick={() => generateQrCode()}
              >
                Establish ID Wallet Connection
              </Button>
              <br />
              {qrCodeData ? (
                <>
                  {connectionAccepted ? (
                    <Alert severity="success" length="300">
                      <AlertTitle>DID Connection Successful</AlertTitle>
                      <strong>
                        Identity Wallet and Mock Airlines connection established.
                      </strong>
                    </Alert>
                  ) : (
                    <>
                      <Alert severity="info" length="300">
                        {/* <AlertTitle>Prompt Passenger</AlertTitle> */}
                        <AlertTitle>Prompt Passenger</AlertTitle>
                        <strong>
                          This will securely share your vaccination status with mock airlines{" "}
                        </strong>
                      </Alert>
                      <br />
                      <QRCodeData value={qrCodeData} size={340} />
                      <br />
                    </>
                  )}
                </>
              ) : null}
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            {/* <Grid item xl={4} lg={4} md={6} sm={12} xs={12}> */}
            <Grid item>
              <br />
              {/* {connectionAccepted ? ( */}
              {qrCodeData ? (
                <>
                  <Button
                    className={classes.btn}
                    variant="contained"
                    color="primary"
                    onClick={() => proofRequest()}
                  >
                    Prompt Me
                  </Button>

                  {!proofAccepted && !proofRejected ? (
                    <>
                      <Alert severity="info" length="300">
                        <AlertTitle>Prompt Passenger</AlertTitle>
                        <strong>
                          Request that the individual share their vaccination
                          status on their device{" "}
                        </strong>
                      </Alert>
                      {"\n"}
                    </>
                  ) : null}

                  {proofRejected ? (
                    <Alert severity="error" length="300">
                      <AlertTitle>Verification Failure</AlertTitle>
                      <strong>Passenger rejected presentation request.</strong>
                    </Alert>
                  ) : null}

                  {proofAccepted ? (
                    <>
                      <Paper
                        square
                        elevation={1}
                        className={classes.verboseContainer}
                      >
                        <h2 className={classes.title} style={{fontSize:18}}>Vaccination Status</h2>
                        <div>
                          <form
                            className={classes.root2}
                            noValidate
                            autoComplete="off"
                          >
                            <TextField
                              disabled
                              id="filled-disabled"
                              label="Passenger Name"
                              // defaultValue={"TEST"}
                              // defaultValue={passengerData.requested_presentation.revealed_attrs.firstName}
                              defaultValue={
                                passengerData.requested_presentation
                                  .revealed_attrs.firstName.value + ' ' +
                                passengerData.requested_presentation
                                  .revealed_attrs.lastName.value
                              }
                              variant="filled"
                            />
                            <TextField
                              disabled
                              id="filled-disabled"
                              label="Disease"
                              defaultValue={
                                passengerData.requested_presentation
                                  .revealed_attrs.disease.value
                              }
                              variant="filled"
                            />
                            <TextField
                              disabled
                              id="filled-disabled"
                              label="Vaccination Status"
                              defaultValue={
                                passengerData.requested_presentation
                                  .revealed_attrs.vaccinationStatus.value
                              }
                              variant="filled"
                            />
                            <TextField
                              disabled
                              id="filled-disabled"
                              label="Vaccination Type"
                              defaultValue={
                                passengerData.requested_presentation
                                  .revealed_attrs.vaccinationType.value
                              }
                              variant="filled"
                            />
                          </form>
                        </div>
                      </Paper>{" "}
                      <br/>
                      <Alert severity="success" length="300">
                        <AlertTitle>Verification Success</AlertTitle>
                        <strong>
                          Passenger successully shared verified credentials.
                        </strong>
                      </Alert>
                    </>
                  ) : null}
                </>
              ) : (
                <Alert severity="warning" length="300">
                  <AlertTitle>DID Connection Required</AlertTitle>
                  <strong>
                    Return to previous step and complete the DID Connection
                    Process{" "}
                  </strong>
                </Alert>
              )}
            </Grid>
          </Grid>
        );
      default:
        return "Unknown step";
    }
  }
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setQrCodeData(null);
  };

  return (
    // <Container className={classes.conatiner}>
    <Container fixed>
      {/* <img
        src="/banner.jpg"
        height="300px"
        width="1230"
        // width="auto"
        alt=" "
        style={{ marginTop: 20 }}
      /> */}

      {/* <button onClick={setVerboseMode}>Press me</button> */}
      <Card>
        <h2 className={classes.title}>
          {/* Time */}
          <time dateTime={response}> {response}</time>
        </h2>
        {/* <h2><img src='/banner.jpg'/></h2> */}
        {/* <h2 className={classes.title}>MockAir QR Scanner</h2> */}
        {verboseMode ? (
          <Grid container>
            <Grid item xs={6}>
              {/* <div className={classes.root}> */}
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    <StepContent>
                      <Typography>{getStepContent(index)}</Typography>
                      <br />
                      {/* <div className={classes.actionsContainer}> */}
                      {/* <div> */}
                      <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        className={classes.button}
                      >
                        Back
                      </Button>

                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        className={classes.button}
                      >
                        {activeStep === steps.length - 1 ? "Finish" : "Next"}
                      </Button>
                      {/* </div> */}
                      {/* </div> */}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {activeStep === steps.length && (
                <Paper square elevation={0} className={classes.resetContainer}>
                  <Typography>
                    <Alert severity="success" length="300">
                      <AlertTitle>Vaccination Verification Success</AlertTitle>
                      <strong>Welcome passenger aboard! </strong>
                    </Alert>
                  </Typography>
                  <Button onClick={handleReset} className={classes.button}>
                    Reset
                  </Button>
                </Paper>
              )}
              {/* </div> */}
            </Grid>
            <Grid item xs={6}>
              <Paper square elevation={1} className={classes.verboseContainer}>
                {/* <h2 className={classes.title}>Details</h2> */}
                <h2 className={classes.title} style={{fontSize:18}}>Details</h2>
                <div>
                  {messages.map((msg) => {
                    return (
                      <pre>
                        {JSON.stringify(msg, null, 2)}
                        {"\n"}
                      </pre>
                    );
                  })}
                </div>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Grid container>
            <Grid item xs={6}>
              {/* <div className={classes.root}> */}
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    <StepContent>
                      <Typography>{getStepContent(index)}</Typography>
                      <br />
                      {/* <div className={classes.actionsContainer}> */}
                      {/* <div> */}
                      <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        className={classes.button}
                      >
                        Back
                      </Button>

                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        className={classes.button}
                      >
                        {activeStep === steps.length - 1 ? "Finish" : "Next"}
                      </Button>
                      {/* </div> */}
                      {/* </div> */}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {activeStep === steps.length && (
                <Paper square elevation={0} className={classes.resetContainer}>
                  <Typography>
                    <Alert severity="success" length="300">
                      <AlertTitle>Welcome passenger aboard</AlertTitle>
                      <strong>Demo Completed!</strong>
                    </Alert>
                  </Typography>
                  <Button onClick={handleReset} className={classes.button}>
                    Reset
                  </Button>
                </Paper>
              )}
              {/* </div> */}
            </Grid>
          </Grid>
        )}

        <h2 className={classes.title}>
          <FormControlLabel
            control={
              <IOSSwitch
                checked={state.checkedB}
                onChange={handleChange}
                name="checkedB"
              />
            }
            label="Verbose Mode"
          />
        </h2>
      </Card>
    </Container>
  );
}

export default App;

// <Grid item xl={4} lg={4} md={6} sm={12} xs={12}>
// <Button className={classes.btn} variant="contained" color="secondary" onClick={onScanFile}>Upload Qr Code</Button>
// <QrReader
//   ref={qrRef}
//   delay={300}
//   style={{width: '100%'}}
//   onError={handleErrorFile}
//   onScan={handleScanFile}
//   legacyMode
// />
// <h3>Data: {scanResultFile}</h3>
// </Grid>

/// Make #2 > #3
//Send Vaccination Proof*
//BUtton should say "Call me on Connect.me"

//Identity wallet connecton QR Code
//If you don't have an identity wallet yet, please download the connect.me application
//from the google play store, apple store, and use it to scan this code

//Once a identity wallet connection is established you will be prompted for the next step to accept the vaccindation credetial

//Establish Connection explain narrative for step 1 on verifier

//Verifier Registration (first, last, DOB)

//Mock Airlines Login sperate app 


//Do the small changes

//Entire new version of Mock Airlines 2.0
//Account management in an SSI World 