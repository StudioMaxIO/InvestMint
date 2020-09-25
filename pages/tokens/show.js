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
    reserveBlockLoading: false,
    sellTokensLoading: false,
    tokensToSell: "",
    tokensToTransfer: "",
    transferToAddress: "",
    isAuthorized: false
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
      }
    }
  }

  authorizeReservation = async event => {
    event.preventDefault();
  };

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

  reserveTokenBlock = async event => {
    event.preventDefault();

    this.setState({ reserveBlockLoading: true, reserveBlockErrorMessage: "" });

    // try {
    //   const accounts = await web3.eth.getAccounts();
    //   await tokenFactory.methods
    //     .createToken(
    //       this.state.tokenName,
    //       this.state.tokenSymbol,
    //       this.state.wholeTokens,
    //       this.state.decimals
    //     )
    //     .send({
    //       from: accounts[0]
    //     });
    //
    //   Router.pushRoute("/funding");
    // } catch (err) {
    //   this.setState({ reserveTokenErrorMessage: err.message });
    // }

    this.setState({ reserveBlockLoading: false });
  };

  sellTokens = async event => {
    event.preventDefault();

    this.setState({ sellTokensLoading: true, sellTokensErrorMessage: "" });
    this.setState({ sellTokensLoading: false });
  };

  transferTokens = async event => {
    event.preventDefault();

    this.setState({
      transferTokensLoading: true,
      transferTokensErrorMessage: ""
    });
    this.setState({ transferTokensLoading: false });
  };

  render() {
    //this.checkAuthorization();
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
                    1 {this.props.tokenSymbol} = {this.props.exchangeRate} ETH
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
  }
}

export default TokenShow;
