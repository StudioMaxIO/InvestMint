import React, { Component } from "react";
import { Form, Button, Input, Message, Grid, Card } from "semantic-ui-react";
import Layout from "../../components/Layout";
import InvestMint from "../../ethereum/investMint";
import Token from "../../ethereum/token";
import web3 from "../../ethereum/web3";
import { Router } from "../../routes";

class TokenShow extends Component {
  state = {
    reserveBlockErrorMessage: "",
    sellTokensErrorMessage: "",
    purchaseBlockErrorMessage: "",
    cancelBlockErrorMessage: "",
    reserveBlockLoading: false,
    sellTokensLoading: false,
    purchaseBlockLoading: false,
    cancelBlockLoading: false,
    tokensToSell: "",
    tokensToTransfer: "",
    transferToAddress: "",
    isAuthorized: false,
    activeReservation: "",
    activeReservationStatus: "",
    activeReservationCost: "",
    activeReservationExpiration: "",
    activeReservationFinalized: false
  };

  static async getInitialProps(props) {
    //const project = Project(props.query.address);

    this._isMounted = false;

    const investMintToken = InvestMint(props.query.address);
    const summary = await investMintToken.methods.getSummary().call();

    return {
      address: props.query.address,
      tokenName: summary[0],
      tokenSymbol: summary[1],
      exchangeRate: summary[4],
      blockCost: summary[3],
      tokensPerBlock: summary[2]
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.checkAuthorization();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async checkAuthorization() {
    const linkToken = Token("0xa36085f69e2889c224210f603d836748e7dc0088");
    const accounts = await web3.eth.getAccounts();

    if (accounts[0]) {
      const authorization = await linkToken.methods
        .allowance(accounts[0], this.props.address)
        .call();

      if (authorization >= 1 * (10 ^ 18)) {
        this._isMounted && this.setState({ isAuthorized: true });
        this.getReservation();
      }
    }
  }

  authorizeLink = async event => {
    event.preventDefault();

    this.setState({ reserveBlockLoading: true, reserveBlockErrorMessage: "" });
    const linkToken = Token("0xa36085f69e2889c224210f603d836748e7dc0088");

    try {
      const accounts = await web3.eth.getAccounts();
      const approvalAmount = "10000000000000000000";
      await linkToken.methods.approve(this.props.address, approvalAmount).send({
        from: accounts[0]
      });
      // const reloadRoute = "/t/" + this.props.address;
      // Router.pushRoute(reloadRoute);
      //checkAuthorization();
      window.location.reload(false);
    } catch (err) {
      this.setState({ reserveTokenErrorMessage: err.message });
    }
    this.setState({ reserveBlockLoading: false });
  };

  async getReservation() {
    const investMintToken = InvestMint(this.props.address);
    const accounts = await web3.eth.getAccounts();
    if (accounts[0]) {
      const activeReservation = await investMintToken.methods
        .getActiveReservation()
        .call({ from: accounts[0] });

      this._isMounted &&
        this.setState({ activeReservation: activeReservation });
    }
    if (this.state.activeReservation == 0) {
      console.log("No current reservations.");
    } else if (this.state.activeReservation != "") {
      console.log("Has reservation: ", this.state.activeReservation);
      const reservationSummary = await investMintToken.methods
        .getReservationSummary(this.state.activeReservation)
        .call();
      this.setState({
        activeReservationCost: reservationSummary[2],
        activeReservationFinalized: reservationSummary[4]
      });
      switch (reservationSummary[1]) {
        case "0":
          this.setState({ activeReservationStatus: "open" });
          break;
        case "1":
          this.setState({ activeReservationStatus: "claimed" });
          break;
        case "2":
          this.setState({ activeReservationStatus: "canceled" });
          break;
        case "3":
          this.setState({ activeReservationStatus: "expired" });
          break;
        default:
          this.setState({ activeReservationStatus: "unknown" });
      }
      let reservationTimestamp = reservationSummary[3];

      var ts = new Date(reservationTimestamp * 1000);
      var months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];
      var hours = [
        "12",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11"
      ];
      var ampm = ts.getHours() < 12 ? "AM" : "PM";
      var year = ts.getFullYear();
      var month = months[ts.getMonth()];
      var date = ts.getDate();
      var hour = hours[ts.getHours()];
      var min = "0" + ts.getMinutes();
      var sec = "0" + ts.getSeconds();
      var formattedDateTime =
        month +
        " " +
        date +
        " " +
        year +
        " " +
        hour +
        ":" +
        min.substr(-2) +
        ":" +
        sec.substr(-2) +
        " " +
        ampm;
      this.setState({ activeReservationExpiration: formattedDateTime });
      //window.location.reload(false);
      //const walletUrl = "/t/" + this.props.address + "/wallet";
      //window.location.assign(walletUrl);
    } else {
    }
  }

  reserveTokenBlock = async event => {
    event.preventDefault();
    console.log("Reserve Token Block...");

    this.setState({ reserveBlockLoading: true, reserveBlockErrorMessage: "" });
    const investMintToken = InvestMint(this.props.address);

    try {
      const accounts = await web3.eth.getAccounts();
      await investMintToken.methods.reserveBlock().send({
        from: accounts[0]
      });
      window.location.reload(false);
      //const walletUrl = "/t/" + this.props.address + "/wallet";
      //window.location.assign(walletUrl);
    } catch (err) {
      this.setState({ reserveTokenErrorMessage: err.message });
    }
    this.setState({ reserveBlockLoading: false });
  };

  purchaseBlock = async event => {
    event.preventDefault();

    this.setState({
      purchaseBlockLoading: true,
      purchaseBlockErrorMessage: ""
    });

    const investMintToken = InvestMint(this.props.address);

    try {
      const accounts = await web3.eth.getAccounts();
      await investMintToken.methods.purchaseBlock().send({
        from: accounts[0],
        value: this.state.activeReservationCost
      });
      //window.location.reload(false);
      const walletUrl = "/t/" + this.props.address + "/wallet";
      window.location.assign(walletUrl);
    } catch (err) {
      this.setState({ purchaseTokenErrorMessage: err.message });
    }
    this.setState({ purchaseBlockLoading: false });
  };

  render() {
    if (
      this.state.activeReservation == "" ||
      this.state.activeReservation == 0
    ) {
      return (
        <Layout page="funding">
          <Grid>
            <Grid.Row>
              <Grid.Column>
                <center>
                  <Card
                    style={{
                      padding: "10px",
                      textAlign: "left",
                      fontSize: "18px"
                    }}
                  >
                    <h2
                      style={{
                        textAlign: "center"
                      }}
                    >
                      {this.props.tokenName} | {this.props.tokenSymbol}
                    </h2>
                    <p
                      style={{
                        textAlign: "center",
                        fontSize: "18px"
                      }}
                    >
                      1 {this.props.tokenSymbol} ={" "}
                      {web3.utils.fromWei(this.props.exchangeRate, "ether")} ETH
                    </p>
                    <p>
                      <strong>Current Block Cost: </strong>
                      <br />
                      {web3.utils.fromWei(this.props.blockCost, "ether")} Ether
                    </p>
                    <p>
                      <strong>Tokens per Block:</strong> <br />
                      {web3.utils.fromWei(
                        this.props.tokensPerBlock,
                        "ether"
                      )}{" "}
                      {this.props.tokenSymbol}
                    </p>
                    <Form
                      onSubmit={
                        this.state.isAuthorized
                          ? this.reserveTokenBlock
                          : this.authorizeLink
                      }
                      error={!!this.state.reserveBlockErrorMessage}
                    >
                      <Message
                        error
                        header="Oops!"
                        content={this.state.reserveBlockErrorMessage}
                      />
                      <center>
                        <Button
                          size="large"
                          loading={this.state.reserveBlockLoading}
                          color="teal"
                        >
                          {this.state.isAuthorized
                            ? "Reserve Block"
                            : "Authorize LINK"}
                        </Button>
                      </center>
                    </Form>
                  </Card>
                </center>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Layout>
      );
    } else {
      return (
        <Layout page="funding">
          <Grid>
            <Grid.Row>
              <Grid.Column>
                <center>
                  <Card
                    style={{
                      padding: "10px",
                      textAlign: "left",
                      fontSize: "18px"
                    }}
                  >
                    <h2
                      style={{
                        textAlign: "center"
                      }}
                    >
                      {this.props.tokenName} | {this.props.tokenSymbol}
                    </h2>
                    <p
                      style={{
                        textAlign: "center",
                        fontSize: "18px"
                      }}
                    >
                      1 {this.props.tokenSymbol} ={" "}
                      {web3.utils.fromwei(this.props.exchangeRate, "ether")} ETH
                    </p>
                    <p>
                      <strong>Reserved Block Cost: </strong>
                      <br />
                      {web3.utils.fromWei(
                        this.state.activeReservationCost,
                        "ether"
                      )}{" "}
                      Ether
                    </p>
                    <p>
                      <strong>Block Expiration: </strong>
                      <br />
                      {this.state.activeReservationExpiration}
                    </p>
                    <p>
                      <strong>Block Status: </strong>
                      <br />
                      {this.state.activeReservationStatus}
                    </p>
                    <p>
                      <strong>Tokens per Block:</strong> <br />
                      {web3.utils.fromWei(
                        this.props.tokensPerBlock,
                        "ether"
                      )}{" "}
                      {this.props.tokenSymbol}
                    </p>
                    <Form
                      onSubmit={this.purchaseBlock}
                      error={!!this.state.purchaseBlockErrorMessage}
                    >
                      <Message
                        error
                        header="Oops!"
                        content={this.state.purchaseBlockErrorMessage}
                      />
                      <center>
                        <Button
                          size="large"
                          loading={this.state.purchaseBlockLoading}
                          color="teal"
                        >
                          {" "}
                          Purchase Block
                        </Button>
                        <br />
                      </center>
                    </Form>

                    <Form>
                      <center>
                        <Button
                          style={{ marginTop: "10px" }}
                          size="large"
                          loading={this.state.cancelBlockLoading}
                          color="red"
                        >
                          {" "}
                          Cancel Reservation
                        </Button>
                      </center>
                    </Form>
                  </Card>
                </center>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Layout>
      );
    }
  }
}

export default TokenShow;
