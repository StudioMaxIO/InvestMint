import React, { Component } from "react";
import { Form, Button, Input, Message, Grid } from "semantic-ui-react";
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
      userBalance: "2004.110",
      exchangeRate: "10000503000000000",
      blockCost: "1000000000023400000",
      tokensPerBlock: "1000"
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
    const accounts = await web3.eth.getAccounts();

    if (accounts[0]) {
      const linkToken = Token("0xa36085f69e2889c224210f603d836748e7dc0088");
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
              <h1>
                {this.props.tokenName} | {this.props.tokenSymbol}
              </h1>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <center>
                <h2>Mint Tokens:</h2>
                <h3>
                  <strong>Block Cost:</strong>{" "}
                  {web3.utils.fromWei(this.props.blockCost, "ether")} Ether
                </h3>
                <h3>
                  <strong>Tokens per Block:</strong> {this.props.tokensPerBlock}{" "}
                  {this.props.tokenSymbol}
                </h3>
                <Form
                  onSubmit={
                    this.state.isAuthorized
                      ? this.reserveTokenBlock
                      : this.authorizeReservation
                  }
                  error={!!this.state.reserveBlockErrorMessage}
                >
                  <Message
                    error
                    header="Oops!"
                    content={this.state.reserveBlockErrorMessage}
                  />
                  <Button loading={this.state.reserveBlockLoading} color="teal">
                    {this.state.isAuthorized
                      ? "Reserve Block"
                      : "Authorize LINK"}
                  </Button>
                </Form>
              </center>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default TokenShow;
