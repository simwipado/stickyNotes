import React from "react";
import { ipcRenderer } from "electron";

const styles = require("./StickyNoteHead.css");

interface Props {
  id: string;
  name: string;
}

function StickyNoteHead(props: Props) {
  const { id, name } = props;
  return (
    <div className={styles.head}>
      <div
        className={styles.add}
        onClick={() => ipcRenderer.send("create-note")}
      >
        +
      </div>
      <div>{name}</div>
      <div
        className={styles.close}
        onClick={() => {
          ipcRenderer.send("remove-note", id);
        }}
      >
        X
      </div>
    </div>
  );
}

export default StickyNoteHead;
