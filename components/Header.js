import React, { Component } from "react";
import { Menu, Segment } from "semantic-ui-react";
import { Link, Router } from "../routes";
const profile = require("../settings/profile");

class Header extends Component {
  //export default () => {
  state = {
    activeItem: this.props.page
  };
  handleItemClick = (e, { name }) => {
    this.setState({ activeItem: name });
    Router.pushRoute("/" + name);
  };
  render() {
    const { activeItem } = this.state;

    return (
      <Segment style={{ marginTop: "10px" }} inverted color="teal">
        <Menu secondary inverted>
          <Link route="/">
            <a className="item">{profile.COMPANY_NAME}</a>
          </Link>
          <Menu.Menu position="right">
            <Menu.Item
              name="create"
              active={activeItem === "create"}
              onClick={this.handleItemClick}
            />
            <Menu.Item
              name="mint"
              active={activeItem === "mint"}
              onClick={this.handleItemClick}
            />
            <Menu.Item
              name="wallet"
              active={activeItem === "wallet"}
              onClick={this.handleItemClick}
            />
          </Menu.Menu>
        </Menu>
      </Segment>
    );
  }
}

export default Header;
