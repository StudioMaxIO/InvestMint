import React, { Component } from "react";
import {
  Card,
  Checkbox,
  Grid,
  Container,
  Header,
  Form,
  Button,
  Input,
  Message
} from "semantic-ui-react";
import Layout from "../components/Layout";
import { Link, Router } from "../routes";
const profile = require("../settings/profile");

class Dashboard extends Component {
  state = {
    tokenAddress: ""
  };

  onSubmit = event => {
    if (this.state.tokenAddress != "") {
      var mintRoute = "/t/" + this.state.tokenAddress;
      Router.pushRoute(mintRoute);
    }
  };

  render() {
    return (
      <Layout>
        <Grid style={{ marginTop: "10px" }}>
          <Grid.Row>
            <Grid.Column color="teal">
              <Container text>
                <Header
                  as="h1"
                  content={profile.COMPANY_NAME}
                  inverted
                  style={{
                    fontSize: "4em",
                    fontWeight: "normal",
                    marginBottom: 0,
                    marginTop: "1em"
                  }}
                />
                <Header
                  as="h2"
                  content={profile.COMPANY_DESCRIPTION}
                  inverted
                  style={{
                    fontSize: "1.7em",
                    fontWeight: "normal",
                    marginTop: "1.5em"
                  }}
                />
              </Container>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <center>
                <Form onSubmit={this.onSubmit}>
                  <Form.Field width={10}>
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
                    Launch Mint
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

export default Dashboard;
