import React, { Component } from "react";
import {
  Grid,
  Form,
  Button,
  Input,
  Message,
  Select,
  Icon,
  Table
} from "semantic-ui-react";
import Layout from "../../components/Layout";
import web3 from "../../ethereum/web3";
import { Router } from "../../routes";

class TokenMintNew extends Component {
  state = {
    tokenName: "",
    tokenSymbol: "",
    wholeTokens: "0",
    decimals: "18",
    errorMessage: "",
    calculateErrorMessage: "",
    tokensPerBlock: "1000",
    potentialInvestors: "100",
    projectedProfits: "0",
    initialPoolPercentage: "10",
    minimumReturn: "10",
    blocksToStabilize: "75",
    blockPricingInput1: "2",
    blockPricingInput2: "#",
    blockPricingOperand: "*",
    coinsToStabilize: "",
    mintFeePostStable: "0.1",
    s2: "",
    s3: "",
    s4: "",
    s5: "",
    s1ProfitsAtStabilization: "",
    s2ProfitsAtStabilization: "",
    s3ProfitsAtStabilization: "",
    s4ProfitsAtStabilization: "",
    s5ProfitsAtStabilization: "",
    s1BlocksToProfit: "",
    s2BlocksToProfit: "",
    s3BlocksToProfit: "",
    s4BlocksToProfit: "",
    s5BlocksToProfit: "",
    s1BlockCost: "",
    s2BlockCost: "",
    s3BlockCost: "",
    s4BlockCost: "",
    s5BlockCost: "",
    loading: false
  };

  calculate = event => {
    event.preventDefault();

    var sampleSize = parseInt(parseInt(this.state.potentialInvestors) / 5);
    var numCoinsToStabilize =
      parseFloat(this.state.blocksToStabilize) *
      parseFloat(this.state.tokensPerBlock);
    var sample2 = sampleSize < 2 ? 2 : sampleSize;
    var sample3 = sampleSize * 2 < 3 ? 3 : sampleSize * 2;
    var sample4 = sampleSize * 3 < 4 ? 4 : sampleSize * 3;
    var sample5 =
      parseInt(this.state.potentialInvestors) < 5
        ? 5
        : parseInt(this.state.potentialInvestors);
    this.setState({
      coinsToStabilize: numCoinsToStabilize,
      s2: sample2,
      s3: sample3,
      s4: sample4,
      s5: sample5
    });

    var operand = this.state.blockPricingOperand;
    var pricingInput1 =
      this.state.blockPricingInput1 == "#"
        ? "#"
        : parseFloat(this.state.blockPricingInput1);
    var pricingInput2 =
      this.state.blockPricingInput2 == "#"
        ? "#"
        : parseFloat(this.state.blockPricingInput2);
    var startingPrice = parseFloat(this.state.startingPrice);
    var tokensPerBlock = parseInt(this.state.tokensPerBlock);

    function getCost(blockNumber) {
      console.log("Block #: ", blockNumber);
      console.log("Input 1: ", pricingInput1);
      console.log("operand: ", operand);
      console.log("Input 2: ", pricingInput2);
      console.log("Starting price: ", startingPrice);
      console.log("tokens per block: ", tokensPerBlock);
      var adjustment = 0;
      switch (operand) {
        case "*":
          if (pricingInput1 == "#") {
            adjustment = blockNumber * pricingInput2;
          } else {
            adjustment = pricingInput1 * blockNumber;
          }
          break;
        case "^":
          if (pricingInput1 == "#") {
            adjustment = Math.pow(blockNumber, pricingInput2);
          } else {
            adjustment = Math.pow(pricingInput1, blockNumber);
          }
          break;
        case "+":
          if (pricingInput1 == "#") {
            adjustment = blockNumber + pricingInput2;
          } else {
            adjustment = pricingInput1 + blockNumber;
          }
          break;
        case "-":
          if (pricingInput1 == "#") {
            adjustment = blockNumber - pricingInput2;
          } else {
            adjustment = pricingInput1 - blockNumber;
          }
          break;
        case "/":
          if (pricingInput1 == "#") {
            adjustment = blockNumber / pricingInput2;
          } else {
            adjustment = pricingInput1 / blockNumber;
          }
          break;
        default:
          if (pricingInput1 == "#") {
            adjustment = blockNumber * pricingInput2;
          } else {
            adjustment = pricingInput1 * blockNumber;
          }
          break;
      }
      var blockCost = startingPrice * tokensPerBlock * adjustment;
      return blockCost;
    }

    this.setState({
      s1BlockCost: getCost(1),
      s2BlockCost: getCost(sample2),
      s3BlockCost: getCost(sample3),
      s4BlockCost: getCost(sample4),
      s5BlockCost: getCost(sample5)
    });

    var targetPrice =
      parseInt(this.state.potentialInvestors) > 5
        ? 5 *
          parseFloat(this.state.s5BlockCost) *
          parseFloat(this.state.minimumReturn)
        : parseInt(this.state.potentialInvestors) *
          parseFloat(this.state.s5BlockCost) *
          parseFloat(this.state.minimumReturn);
  };

  onSubmit = async event => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();
      /*await tokenMintFactory.methods
        .createToken(
          this.state.tokenName,
          this.state.tokenSymbol,
          this.state.wholeTokens,
          this.state.decimals
        )
        .send({
          from: accounts[0]
        });*/

      Router.pushRoute("/funding");
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
              <h2>Create a Mintable ERC-20 Token</h2>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <h3>Token Details</h3>
            </Grid.Column>
          </Grid.Row>
          <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
            <Grid.Row>
              <Grid.Column>
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
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Form.Group widths="equal">
                  <Form.Field>
                    <label>Decimals</label>
                    <Input
                      value={this.state.decimals}
                      onChange={event =>
                        this.setState({ decimals: event.target.value })
                      }
                    />
                  </Form.Field>
                  <Form.Field>
                    <label>Tokens Per Block</label>
                    <Input
                      value={this.state.tokensPerBlock}
                      onChange={event =>
                        this.setState({ tokensPerBlock: event.target.value })
                      }
                    />
                  </Form.Field>
                </Form.Group>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Message
                  error
                  header="Oops!"
                  content={this.state.errorMessage}
                />
                <br />
              </Grid.Column>
            </Grid.Row>
          </Form>
          <Grid.Row>
            <Grid.Column>
              <h3>Profit Calculator</h3>
            </Grid.Column>
          </Grid.Row>
          <Form
            onSubmit={this.calculate}
            error={!!this.state.calculateErrorMessage}
          >
            <Grid.Row>
              <Grid.Column>
                <Form.Group widths="equal">
                  <Form.Field>
                    <label>Potential Investors</label>
                    <Input
                      value={this.state.potentialInvestors}
                      onChange={event =>
                        this.setState({
                          potentialInvestors: event.target.value
                        })
                      }
                    />
                  </Form.Field>
                </Form.Group>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Form.Group widths="equal">
                  <Form.Field>
                    <label>Projected Profits</label>
                    <Input
                      label="ether"
                      labelPosition="right"
                      value={this.state.projectedProfits}
                      onChange={event =>
                        this.setState({ projectedProfits: event.target.value })
                      }
                    />
                  </Form.Field>
                  <Form.Field>
                    <label>% of Profits to Pool</label>
                    <Input
                      label="%"
                      labelPosition="right"
                      value={this.state.initialPoolPercentage}
                      onChange={event =>
                        this.setState({
                          initialPoolPercentage: event.target.value
                        })
                      }
                    />
                  </Form.Field>
                </Form.Group>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Form.Group widths="equal">
                  <Form.Field>
                    <label>Minimum Return</label>
                    <Input
                      label="X"
                      labelPosition="right"
                      value={this.state.minimumReturn}
                      onChange={event =>
                        this.setState({ minimumReturn: event.target.value })
                      }
                    />
                  </Form.Field>
                  <Form.Field>
                    <label>Blocks to Stabilize</label>
                    <Input
                      value={this.state.blocksToStabilize}
                      onChange={event =>
                        this.setState({ blocksToStabilize: event.target.value })
                      }
                    />
                  </Form.Field>
                </Form.Group>
                <br />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
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
                  <Form.Field
                    control="select"
                    value={this.state.blockPricingOperand}
                    onChange={event =>
                      this.setState({
                        blockPricingOperand: event.target.value
                      })
                    }
                  >
                    <option value="*">*</option>
                    <option value="^">^</option>
                    <option value="+">+</option>
                    <option value="-">-</option>
                    <option value="/">/</option>
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
                  </Form.Field>
                </Form.Group>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Button
                  color="teal"
                  style={{
                    marginBottom: "20px"
                  }}
                >
                  Calculate
                </Button>
              </Grid.Column>
            </Grid.Row>
          </Form>
          <Grid.Row>
            <Grid.Column>
              <h3>Summary:</h3>
              <p>
                This mint fee of{" "}
                <strong>
                  (
                  {this.state.blockPricingInput1 == "#"
                    ? "Block #"
                    : this.state.blockPricingInput1}{" "}
                  {this.state.blockPricingOperand}{" "}
                  {this.state.blockPricingInput2 == "#"
                    ? "Block #"
                    : this.state.blockPricingInput2}
                  )
                </strong>{" "}
                will be in effect for the first{" "}
                <strong>
                  {this.state.blocksToStabilize} blocks (
                  {this.state.coinsToStabilize} tokens)
                </strong>
                .
              </p>
              <p>
                The price will stabilize at <strong>xxx.xx ether</strong> per
                token with a stable mint fee of <strong>xxx.xx ETH</strong>.
              </p>
              <p>
                Assuming <strong>{this.state.initialPoolPercentage}%</strong> of
                profits of <strong>{this.state.projectedProfits} ether</strong>{" "}
                are contributed to the liquidity pool:
              </p>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Table celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Block</Table.HeaderCell>
                    <Table.HeaderCell>Cost</Table.HeaderCell>
                    <Table.HeaderCell>Blocks to Break Even</Table.HeaderCell>
                    <Table.HeaderCell>
                      Blocks to {this.state.minimumReturn}X
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  <Table.Row>
                    <Table.Cell>Block #1</Table.Cell>
                    <Table.Cell>{this.state.s1BlockCost} ETH</Table.Cell>
                    <Table.Cell>{this.state.s1BlocksToProfit}</Table.Cell>
                    <Table.Cell>xxx</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Block #{this.state.s2}</Table.Cell>
                    <Table.Cell>{this.state.s2BlockCost} ETH</Table.Cell>
                    <Table.Cell>{this.state.s2BlocksToProfit}</Table.Cell>
                    <Table.Cell>xxx</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Block #{this.state.s3}</Table.Cell>
                    <Table.Cell>{this.state.s3BlockCost} ETH</Table.Cell>
                    <Table.Cell>{this.state.s3BlocksToProfit}</Table.Cell>
                    <Table.Cell>xxx</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Block #{this.state.s4}</Table.Cell>
                    <Table.Cell>{this.state.s4BlockCost} ETH</Table.Cell>
                    <Table.Cell negative>
                      {this.state.s4BlocksToProfit}
                    </Table.Cell>
                    <Table.Cell negative>Too Many</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Block #{this.state.s5}</Table.Cell>
                    <Table.Cell>{this.state.s5BlockCost} ETH</Table.Cell>
                    <Table.Cell negative>
                      {this.state.s5BlocksToProfit}
                    </Table.Cell>
                    <Table.Cell negative>Too Many</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <br />
      </Layout>
    );
  }
}

export default TokenMintNew;
