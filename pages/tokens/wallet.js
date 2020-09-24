import React, { Component } from "react";
import { Form, Button, Input, Message, Grid } from "semantic-ui-react";
import Layout from "../../components/Layout";
import web3 from "../../ethereum/web3";
import Token from "../../ethereum/token";
import { Router } from "../../routes";

class TokenShow extends Component {
  state = {
    reserveBlockErrorMessage: "",
    sellTokensErrorMessage: "",
    reserveBlockLoading: false,
    sellTokensLoading: false,
    tokensToSell: "",
    tokensToTransfer: "",
    transferToAddress: ""
  };

  static async getInitialProps(props) {
    //const project = Project(props.query.address);

    //const summary = await project.methods.getSummary().call();

    return {
      address: props.query.address,
      tokenName: "Token Name",
      tokenSymbol: "TKNS",
      userBalance: "2004.110",
      exchangeRate: "10000503000000000",
      blockCost: "1000000000023400000",
      tokensPerBlock: "1000"
    };
  }

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
    return (
      <Layout page="wallet">
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <h2>
                {this.props.tokenName} | {this.props.tokenSymbol}
              </h2>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <h3>Token Address: {this.props.address}</h3>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              <h3>
                1 {this.props.tokenSymbol} ={" "}
                {web3.utils.fromWei(this.props.exchangeRate, "ether")} Ether
              </h3>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={7}>
              <h3>Sell Tokens:</h3>
              <Form
                onSubmit={this.sellTokens}
                error={!!this.state.sellTokensErrorMessage}
              >
                <Form.Field>
                  <Input
                    label={this.props.tokenSymbol}
                    labelPosition="right"
                    value={this.state.tokensToSell}
                    onChange={event =>
                      this.setState({ tokensToSell: event.target.value })
                    }
                  />
                </Form.Field>
                <Message
                  error
                  header="Oops!"
                  content={this.state.sellTokensErrorMessage}
                />
                <Button loading={this.state.sellTokensLoading} color="teal">
                  Sell Tokens
                </Button>
              </Form>
            </Grid.Column>
          </Grid.Row>
          <Grid.Column width={10}>
            <h3>Transfer Tokens:</h3>
            <p>
              <strong>
                Balance:&nbsp;{this.props.userBalance}&nbsp;
                {this.props.tokenSymbol}
              </strong>
            </p>
            <Form
              onSubmit={this.transferTokens}
              error={!!this.state.transferTokensErrorMessage}
            >
              <Form.Field>
                <label>Trasfer to:</label>
                <Input
                  placeholder="Wallet Address: 0x..."
                  value={this.state.tokensToTransfer}
                  onChange={event =>
                    this.setState({ tokensToTransfer: event.target.value })
                  }
                />
              </Form.Field>
              <Message
                error
                header="Oops!"
                content={this.state.transferTokensErrorMessage}
              />
              <Button color="teal" loading={this.state.transferTokensLoading}>
                Transfer
              </Button>
            </Form>
          </Grid.Column>
        </Grid>
      </Layout>
    );
  }
}

export default TokenShow;
