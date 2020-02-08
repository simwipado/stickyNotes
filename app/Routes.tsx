import * as React from "react";
import { Switch, Route } from "react-router";
const routes = require("./constants/routes.json");
import App from "./containers/App";
import StickyNote from "./containers/StickyNote";

export default () => (
  <App>
    <Switch>
      <Route path={routes.StickyNote} component={StickyNote} />
    </Switch>
  </App>
);
