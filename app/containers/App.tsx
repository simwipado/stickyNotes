import * as React from "react";

export default function App(props: { children: any }) {
  return <React.Fragment>{props.children}</React.Fragment>;
}
