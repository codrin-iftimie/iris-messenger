import PublicMessage from "./PublicMessage.js";
import { InfiniteLoader, List } from "react-virtualized";
import React, { useState, useEffect, useRef, useMemo } from "react";
import PublicMessages from "../PublicMessages.js";

const list = [];

function isRowLoaded({ index }) {
  return !!list[index];
}

function loadImage(base64) {
  return new Promise((resolve) => {
    var img = document.createElement('img');
      img.src = base64;
      img.style="max-height: 80vh; max-width=763px";
      document.body.appendChild(img)
      img.onload = function() {
        const height = img.height;
        document.body.removeChild(img)
        resolve(height)
      }
  })
}

function loadMoreRows({ startIndex, stopIndex }) {

}

function add({key, hash, height}, elements) {
  if (elements.has(key)) return elements;
  return new Map(elements.set(key, {key, hash, height}));

}

export default function MessageFeed(props) {
  const [bounds, setBounds] = useState();
  const [messages, updateMessages] = useState(new Map());
  const [pile, updatePile] = useState(new Map());
  const wrapEl = useRef(null);

  useEffect(() => {
    const { offsetWidth, offsetHeight } = wrapEl.current;

    setBounds({
      width: offsetWidth,
      height: offsetHeight,
    });
  }, []);

  useEffect(() => {
    const subscribe = (params) => {
      props.node
        .get({ ".": params })
        .map()
        .on(async(hash, key, a, eve) => {
          if (!hash) {
            return
          }
          const data = await PublicMessages.getMessageByHash(hash)
          let height = 172;
          if (data.signedData.attachments) {
            height = 172 + 10 + await loadImage(data.signedData.attachments[0].data);
          }
          if (data.signedData.text.split('\n').length) {
            height = height + (data.signedData.text.split('\n').length  - 1)* 18
          }

          console.log(height)
          updateMessages((messages) => {
            return add({key, hash, height}, messages)
          });
        });
    };

    subscribe({ "<": "" });
  }, []);

  const sortedMessages = useMemo(() => {
    const sortedKeys = [...messages.keys()].sort();
    return sortedKeys.map((k) => messages.get(k)).reverse();
  }, [messages]);

  function rowRenderer({ key, index, style }) {
    const hash = sortedMessages[index].hash;
    if (!hash) {
      return (
        <div key={key} style={style}>
          "Decrpting message"
        </div>
      );
    }

    return (
      <div key={key} style={style}>
        <PublicMessage key={key} hash={hash} />
      </div>
    );
  }

  return (
    <div className="feed-messages-wrap" ref={wrapEl}>
      <InfiniteLoader
        isRowLoaded={isRowLoaded}
        loadMoreRows={loadMoreRows}
        rowCount={sortedMessages.length}
      >
        {({ onRowsRendered, registerChild }) => {
          if (!bounds) {
            return null;
          }

          return (
            <List
              height={bounds.height}
              onRowsRendered={onRowsRendered}
              ref={registerChild}
              rowCount={sortedMessages.length}
              rowHeight={({index}) => {
                console.log(sortedMessages[index])
               return sortedMessages[index].height
              }}
              width={bounds.width}
              rowRenderer={rowRenderer}
            />
          );
        }}
      </InfiniteLoader>
    </div>
  );
}
