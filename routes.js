const routes = require("next-routes")();

routes
  .add("/dashboard", "/")
  .add("/create", "tokens/new")
  .add("/t/:address", "/tokens/show")
  .add("/wallet", "/load-wallet")
  .add("/mint", "/load-mint")
  .add("/t/:address/wallet", "/tokens/wallet");

module.exports = routes;
