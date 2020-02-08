import React, { useEffect, useState, useRef } from "react";
import StickyNoteHead from "../components/StickyNoteHead";
import { ipcRenderer } from "electron";
import { Note } from "app/utils/types";
import { Editor, EditorState, ContentState } from "draft-js";

const styles = require("./StickyNote.css");

function StickyNote() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const editor = useRef(null);

  useEffect(() => {
    ipcRenderer.on("note-data", (_, note: Note) => {
      setEditorState(
        EditorState.createWithContent(ContentState.createFromText(note.content))
      );
      setName(note.config.name);
      setId(note.id);
    });
  }, []);
  return (
    <div className={styles.stickyNote}>
      <StickyNoteHead name={name} id={id} />
      <div className={styles.content} onClick={() => editor.current.focus()}>
        <Editor
          onChange={setEditorState}
          editorState={editorState}
          ref={editor}
          onBlur={() => {
            ipcRenderer.send(
              "update-content",
              id,
              editorState.getCurrentContent().getPlainText()
            );
          }}
        ></Editor>
      </div>
    </div>
  );
}

export default StickyNote;
