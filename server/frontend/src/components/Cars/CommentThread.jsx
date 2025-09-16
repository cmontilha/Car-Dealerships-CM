import React, { useState } from "react";

import "./CommentThread.css";

const CommentThread = ({ comments, onReply, onLike, onEdit, onDelete, currentUser }) => {
  return (
    <div className="comment-thread">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onLike={onLike}
          onEdit={onEdit}
          onDelete={onDelete}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
};

const CommentItem = ({ comment, onReply, onLike, onEdit, onDelete, currentUser }) => {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editText, setEditText] = useState(comment.content);

  const handleReplySubmit = (event) => {
    event.preventDefault();
    onReply(comment.id, replyText);
    setReplying(false);
    setReplyText("");
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    onEdit(comment.id, editText);
    setEditing(false);
  };

  return (
    <div className="comment-item">
      <div className="comment-header">
        <div>
          <strong>{comment.user.full_name}</strong>
          <span className="comment-meta"> • {new Date(comment.created_at).toLocaleString()}</span>
        </div>
        <div className="comment-actions">
          <button
            type="button"
            className={`btn btn-sm ${comment.liked ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => onLike(comment.id)}
          >
            Curtir ({comment.likes})
          </button>
          {currentUser && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setReplying((open) => !open);
                setEditing(false);
              }}
            >
              Responder
            </button>
          )}
          {comment.can_edit && (
            <>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setEditing((open) => !open);
                  setReplying(false);
                  setEditText(comment.content);
                }}
              >
                Editar
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => onDelete(comment.id)}
              >
                Excluir
              </button>
            </>
          )}
        </div>
      </div>
      {editing ? (
        <form className="comment-form" onSubmit={handleEditSubmit}>
          <textarea
            className="form-control"
            rows="3"
            value={editText}
            onChange={(event) => setEditText(event.target.value)}
            required
          />
          <div className="d-flex gap-2 mt-2">
            <button className="btn btn-accent btn-sm" type="submit">
              Salvar
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              type="button"
              onClick={() => {
                setEditing(false);
                setEditText(comment.content);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <p className="comment-content">{comment.content}</p>
      )}
      {replying && (
        <form className="comment-form" onSubmit={handleReplySubmit}>
          <textarea
            className="form-control"
            rows="2"
            placeholder="Escreva sua resposta"
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            required
          />
          <div className="d-flex gap-2 mt-2">
            <button className="btn btn-accent btn-sm" type="submit">
              Responder
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              type="button"
              onClick={() => {
                setReplying(false);
                setReplyText("");
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          <CommentThread
            comments={comment.replies}
            onReply={onReply}
            onLike={onLike}
            onEdit={onEdit}
            onDelete={onDelete}
            currentUser={currentUser}
          />
        </div>
      )}
    </div>
  );
};

export default CommentThread;
