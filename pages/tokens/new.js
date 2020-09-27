import React, { Component } from "react";
import {
  Grid,
  Form,
  Button,
  Input,
  Message,
  Select,
  Icon,
  Table,
  Card
} from "semantic-ui-react";
import Layout from "../../components/Layout";
import investMintFactory from "../../ethereum/investMintFactory";
import web3 from "../../ethereum/web3";
import { Router } from "../../routes";

class InvestMintNew extends Component {
  state = {
    tokenName: "",
    tokenSymbol: "",
    errorMessage: "",
    tokensPerBlock: "1000",
    minimumReturn: "10",
    blocksToStabilize: "75",
    blockPricingInput1: "#",
    blockPricingInput2: "1000",
    blockPricingOperand: "/",
    stableMintFee: "0.1",
    loading: false
  };

  onSubmit = async event => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();
      newToken = await investMintFactory.methods
        .createToken(
          this.state.tokenName,
          this.state.tokenSymbol,
          this.state.blockPricingInput1,
          this.state.blockPricingOperand,
          this.state.blockPricingInput2,
          this.state.blocksToStabilize,
          web3.utils.toWei(this.state.stableMintFee, "ether"),
          web3.utils.toWei(this.state.tokensPerBlock, "ether")
        )
        .send({ from: accounts[0] });
      const tokenUrl = "/t/" + newToken;
      window.location.assign(walletUrl);
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false });
  };

  render() {
    return (
      <Layout page="create">
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <center>
                <Card
                  fluid
                  style={{
                    padding: "10px",
                    textAlign: "left",
                    fontSize: "18px"
                  }}
                >
                  <h2>Create New InvestMint Token</h2>
                  <Form
                    onSubmit={this.onSubmit}
                    error={!!this.state.errorMessage}
                  >
                    <Form.Group widths="equal">
                      <Form.Field>
                        <label>Token Name</label>
                        <Input
                          value={this.state.tokenName}
                          onChange={event =>
                            this.setState({ tokenName: event.target.value })
                          }
                        />
                      </Form.Field>
                    </Form.Group>
                    <Form.Group widths="equal">
                      <Form.Field>
                        <label>Token Symbol</label>
                        <Input
                          value={this.state.tokenSymbol}
                          onChange={event =>
                            this.setState({ tokenSymbol: event.target.value })
                          }
                        />
                      </Form.Field>
                    </Form.Group>
                    <Form.Group inline>
                      <Form.Field
                        label="Mint Fee Pricing:"
                        control="select"
                        value={this.state.blockPricingInput1}
                        onChange={event =>
                          this.setState({
                            blockPricingInput1: event.target.value,
                            blockPricingInput2:
                              event.target.value != "#"
                                ? "#"
                                : this.state.blockPricingInput2
                          })
                        }
                      >
                        <option value="#">Number of Blocks</option>
                        <option value="0.5">0.5</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                      </Form.Field>
                      <Form.Field
                        control="select"
                        value={this.state.blockPricingOperand}
                        onChange={event =>
                          this.setState({
                            blockPricingOperand: event.target.value
                          })
                        }
                      >
                        <option value="/">/</option>
                        <option value="*">*</option>
                        <option value="^">^</option>
                        <option value="+">+</option>
                        <option value="-">-</option>
                      </Form.Field>
                      <Form.Field
                        control="select"
                        value={this.state.blockPricingInput2}
                        onChange={event =>
                          this.setState({
                            blockPricingInput2: event.target.value,
                            blockPricingInput1:
                              event.target.value != "#"
                                ? "#"
                                : this.state.blockPricingInput1
                          })
                        }
                      >
                        <option value="#">Number of Blocks</option>
                        <option value="0.5">0.5</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
                        <option value="40">40</option>
                        <option value="50">50</option>
                        <option value="60">60</option>
                        <option value="70">70</option>
                        <option value="80">80</option>
                        <option value="90">90</option>
                        <option value="100">100</option>
                        <option value="200">200</option>
                        <option value="300">300</option>
                        <option value="400">400</option>
                        <option value="500">500</option>
                        <option value="600">600</option>
                        <option value="700">700</option>
                        <option value="800">800</option>
                        <option value="900">900</option>
                        <option value="1000">1000</option>
                      </Form.Field>
                    </Form.Group>
                    <Form.Group widths="equal">
                      <Form.Field>
                        <label>Tokens Per Block</label>
                        <Input
                          value={this.state.tokensPerBlock}
                          onChange={event =>
                            this.setState({
                              tokensPerBlock: event.target.value
                            })
                          }
                        />
                      </Form.Field>
                      <Form.Field>
                        <label>Blocks to Stabilize</label>
                        <Input
                          value={this.state.blocksToStabilize}
                          onChange={event =>
                            this.setState({
                              blocksToStabilize: event.target.value
                            })
                          }
                        />
                      </Form.Field>
                      <Form.Field>
                        <label>Stable Mint Fee</label>
                        <Input
                          value={this.state.stableMintFee}
                          onChange={event =>
                            this.setState({ stableMintFee: event.target.value })
                          }
                        />
                      </Form.Field>
                    </Form.Group>
                    <Message
                      error
                      header="Oops!"
                      content={this.state.errorMessage}
                    />
                    <center>
                      <Button size="huge" color="teal">
                        Create{" "}
                        {this.state.tokenSymbol
                          ? this.state.tokenSymbol
                          : "Token"}
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

export default InvestMintNew;
