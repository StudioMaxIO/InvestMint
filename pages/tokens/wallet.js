import React, { Component } from "react";
import { Form, Button, Input, Message, Grid, Card } from "semantic-ui-react";
import Layout from "../../components/Layout";
import web3 from "../../ethereum/web3";
import InvestMint from "../../ethereum/investMint";
import { Router, Link } from "../../routes";

class TokenWallet extends Component {
  state = {
    exchangeTokensErrorMessage: "",
    exchangeTokensLoading: false,
    tokensToExchange: "",
    userBalance: "",
    exchangeButtonText: "Enter Amount to Exchange"
  };

  static async getInitialProps(props) {
    this._isMounted = false;
    const imToken = InvestMint(props.query.address);
    const summary = await imToken.methods.getSummary().call();

    return {
      address: props.query.address,
      tokenName: summary[0],
      tokenSymbol: summary[1],
      tokensPerBlock: summary[2],
      exchangeRate: summary[4],
      blockCost: summary[3]
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.loadUserData();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  setExchangeValue = event => {
    var buttonText = "Enter Amount To Exchange";

    if (event.target.value != "") {
      const totalExchange =
        web3.utils.fromWei(this.props.exchangeRate, "ether") *
        event.target.value;
      buttonText = "Exchange for " + totalExchange + " ETH";
    }

    this.setState({
      tokensToExchange: event.target.value,
      exchangeButtonText: buttonText
    });
  };

  exchangeTokens = async event => {
    event.preventDefault();
    this.setState({
      exchangeTokensLoading: true,
      exchangeTokensErrorMessage: ""
    });

    const imToken = InvestMint(this.props.address);

    try {
      if (
        web3.utils.toWei(this.state.tokensToExchange, "ether") >
        this.state.userBalance
      ) {
        this.setState({ exchangeTokenErrorMessage: "Too many tokens" });
        throw "Value must be less than or equal to user balance.";
      }
      const accounts = await web3.eth.getAccounts();
      await imToken.methods
        .exchangeTokens(web3.utils.toWei(this.state.tokensToExchange, "ether"))
        .send({
          from: accounts[0]
        });
    } catch (err) {
      this.setState({ exchangeTokenErrorMessage: err.message });
    }

    this.setState({ exchangeTokensLoading: false });
    this.loadUserData();
  };

  async loadUserData() {
    const accounts = await web3.eth.getAccounts();
    if (accounts[0]) {
      const imToken = InvestMint(this.props.address);
      const ub = await imToken.methods.balanceOf(accounts[0]).call();
      this.setState({ userBalance: ub });
    }
  }

  render() {
    return (
      <Layout page="wallet">
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
                    {web3.utils.fromWei(this.props.exchangeRate, "ether")} Ether
                  </p>
                  <p>
                    <strong>Balance:</strong>
                    <br />
                    {web3.utils.fromWei(this.state.userBalance, "ether")}
                  </p>
                  <p>
                    <strong>Exchange Tokens:</strong>
                  </p>
                  <Form
                    onSubmit={this.exchangeTokens}
                    error={!!this.state.exchangeTokensErrorMessage}
                  >
                    <Form.Field>
                      <Input
                        label={this.props.tokenSymbol}
                        labelPosition="right"
                        value={this.state.tokensToExchange}
                        onChange={event => this.setExchangeValue(event)}
                      />
                    </Form.Field>
                    <Message
                      error
                      header="Oops!"
                      content={this.state.exchangeTokensErrorMessage}
                    />
                    <center>
                      <Button
                        size="huge"
                        loading={this.state.exchangeTokensLoading}
                        color="teal"
                      >
                        {this.state.exchangeButtonText}
                      </Button>
                    </center>
                  </Form>
                </Card>
              </center>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <center>
                <Link route={"/t/" + this.props.address}>
                  <strong>
                    <a href="">Mint More {this.props.tokenSymbol}</a>
                  </strong>
                </Link>
              </center>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default TokenWallet;
