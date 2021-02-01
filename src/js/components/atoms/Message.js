import React, { useState } from "react";

// TODO: maybe use this one
export function Message({
  onNameClick,
  from,
  name,
  showName,
  isAuthor,
  onDelete,
  torrentId,
  replyingTo,
  openAttachmentsGallery,
  asReply,
  toggleReplies,
  onLikeClick,
  liked,
  hash,
  sortedReplies,
}) {
  const [showLikes, setShowLikes] = useState(false);

  return (
    <div class="msg ">
      <div class="msg-content">
        <div class="msg-sender">
          <div class="msg-sender-link" onClick={onNameClick}>
            {from ? <Identicon str={from} width={40} /> : null}
            {name &&
              showName &&
              html`<small class="msgSenderName">${name}</small>`}
          </div>
          {isAuthor ? (
            <div class="msg-menu-btn">
              <div class="dropdown">
                <div class="dropbtn">\u2026</div>
                <div class="dropdown-content">
                  <a href="#" onClick={onDelete}>
                    Delete
                  </a>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div id={torrentId} />
        {attachments &&
          attachments.map((a) => (
            <div class="img-container">
              <img src={a.data} onclick={openAttachmentsGallery} />
            </div>
          ))}
        <div
          class={`text ${emojiOnly && "emoji-only"}`}
          dangerouslySetInnerHTML={{ __html: innerHTML }}
        />
        {replyingTo && !asReply ? (
          <div>
            <a href="/post/${encodeURIComponent(replyingTo)}">
              Show replied message
            </a>
          </div>
        ) : null}
        <div class="below-text">
          <a class="msg-btn reply-btn" onClick={toggleReplies}>
            ${replyIcon}
          </a>
          <span class="count" onClick={toggleReplies}>
            {replies || ""}
          </span>
          <a
            class={`msg-btn like-btn ${liked ? "liked" : ""}`}
            onClick={onLikeClick}
          >
            {liked ? heartFull : heartEmpty}
          </a>
          <span class="count" onClick={() => setShowLikes((val) => !val)}>
            {likes || ""}
          </span>
          <div class="time">
            <a href="/post/${encodeURIComponent(hash)}">
              ${Helpers.getRelativeTimeText(time)}
            </a>
          </div>
        </div>
        {showLikes ? (
          <div class="likes">
            $
            {Array.from(this.likedBy).map((key) => {
              return html`<${Identicon}
                showTooltip=${true}
                onClick=${() => route("/profile/" + key)}
                str=${key}
                width="32"
              />`;
            })}
          </div>
        ) : (
          ""
        )}
        {(showReplies || this.state.showReplyForm) && sortedReplies?.length
          ? sortedReplies.map((r) => (
              <PublicMessage
                hash={r.hash}
                asReply={true}
                showName={true}
                showReplies={true}
              />
            ))
          : null}
        {showReplyForm ? (
          <MessageForm activeChat="public" replyingTo={hash} />
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
