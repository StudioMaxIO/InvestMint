import React, { Component } from "react";
import { Form, Button, Input, Message, Grid, Card } from "semantic-ui-react";
import Layout from "../components/Layout";
import web3 from "../ethereum/web3";
import { Router } from "../routes";

class WalletLoader extends Component {
  state = {
    tokenAddress: ""
  };

  onSubmit = event => {
    if (this.state.tokenAddress != "") {
      var walletRoute = "/t/" + this.state.tokenAddress + "/wallet";
      Router.pushRoute(walletRoute);
    }
  };

  render() {
    return (
      <Layout page="wallet">
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <center>
                <Card
                  fluid
                  style={{
                    paddingTop: "10px",
                    paddingBottom: "20px",
                    paddingLeft: "40px",
                    paddingRight: "40px"
                  }}
                >
                  <center>
                    <h1>Wallet</h1>
                    <Form onSubmit={this.onSubmit}>
                      <Form.Field>
                        <Input
                          placeholder="InvestMint Token Address: 0x..."
                          value={this.state.tokenAddress}
                          onChange={event =>
                            this.setState({ tokenAddress: event.target.value })
                          }
                        />
                      </Form.Field>
                      <Button
                        size="huge"
                        color="teal"
                        loading={this.state.sellTokensLoading}
                      >
                        Launch Wallet
                      </Button>
                    </Form>
                  </center>
                </Card>
              </center>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default WalletLoader;
