import React, { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import AuthContext from "../../context/AuthContext";
import Header from "../Header/Header";
import CommentThread from "./CommentThread";
import "./CarDetail.css";

const formatCurrency = (value) =>
  Number.isFinite(value) ? value.toLocaleString("en-US", { maximumFractionDigits: 0 }) : value;

const CarDetail = () => {
  const { carId } = useParams();
  const { user } = useContext(AuthContext);
  const [car, setCar] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const fetchCar = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/djangoapp/api/cars/${carId}/`, {
          credentials: "include",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Carro não encontrado.");
        }
        setCar(data.car);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
    return () => controller.abort();
  }, [carId]);

  const loadComments = useCallback(async () => {
    setCommentsLoading(true);
    setStatusMessage("");
    try {
      const response = await fetch(`/djangoapp/api/cars/${carId}/comments/`, {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível carregar os comentários.");
      }
      setComments(data.comments || []);
      setCar((prev) =>
        prev ? { ...prev, comment_count: data.comments?.length ?? prev.comment_count } : prev
      );
    } catch (err) {
      setStatusMessage(err.message);
    } finally {
      setCommentsLoading(false);
    }
  }, [carId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleFavorite = async () => {
    if (!user) {
      setStatusMessage("Faça login para favoritar este carro.");
      return;
    }
    try {
      const response = await fetch(`/djangoapp/api/cars/${carId}/favorite/`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível atualizar os favoritos.");
      }
      setCar((prev) =>
        prev
          ? {
              ...prev,
              is_favorite: data.favorited,
              favorite_count: data.favorites,
            }
          : prev
      );
      setStatusMessage(data.favorited ? "Carro favoritado com sucesso." : "Favorito removido.");
    } catch (err) {
      setStatusMessage(err.message);
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      setStatusMessage("É necessário estar logado para comentar.");
      return;
    }
    if (!commentText.trim()) {
      setStatusMessage("Digite um comentário antes de enviar.");
      return;
    }
    setPostingComment(true);
    try {
      const response = await fetch(`/djangoapp/api/cars/${carId}/comments/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: commentText }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível enviar o comentário.");
      }
      setCommentText("");
      await loadComments();
      setCar((prev) =>
        prev ? { ...prev, comment_count: prev.comment_count + 1 } : prev
      );
    } catch (err) {
      setStatusMessage(err.message);
    } finally {
      setPostingComment(false);
    }
  };

  const handleReply = async (parentId, content) => {
    if (!user) {
      setStatusMessage("Faça login para responder a um comentário.");
      return;
    }
    if (!content.trim()) {
      setStatusMessage("O texto da resposta não pode ficar vazio.");
      return;
    }
    try {
      const response = await fetch(`/djangoapp/api/cars/${carId}/comments/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, parent_id: parentId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível responder.");
      }
      await loadComments();
      setCar((prev) =>
        prev ? { ...prev, comment_count: prev.comment_count + 1 } : prev
      );
    } catch (err) {
      setStatusMessage(err.message);
    }
  };

  const handleEdit = async (commentId, content) => {
    if (!content.trim()) {
      setStatusMessage("O comentário não pode estar vazio.");
      return;
    }
    try {
      const response = await fetch(`/djangoapp/api/cars/${carId}/comments/${commentId}/`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível editar o comentário.");
      }
      await loadComments();
    } catch (err) {
      setStatusMessage(err.message);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const response = await fetch(`/djangoapp/api/cars/${carId}/comments/${commentId}/`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível remover o comentário.");
      }
      await loadComments();
      setCar((prev) =>
        prev
          ? { ...prev, comment_count: Math.max(0, prev.comment_count - 1) }
          : prev
      );
    } catch (err) {
      setStatusMessage(err.message);
    }
  };

  const handleLike = async (commentId) => {
    if (!user) {
      setStatusMessage("Faça login para curtir comentários.");
      return;
    }
    try {
      const response = await fetch(`/djangoapp/api/comments/${commentId}/like/`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível atualizar a curtida.");
      }
      await loadComments();
    } catch (err) {
      setStatusMessage(err.message);
    }
  };

  if (loading) {
    return (
      <div className="app-loading d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="car-detail-page">
        <Header />
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            {error || "Carro não encontrado."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="car-detail-page">
      <Header />
      <div className="car-hero" style={{ backgroundImage: `url(${car.image_url})` }}>
        <div className="container">
          <span className="badge bg-dark text-uppercase mb-3">{car.brand}</span>
          <h1 className="display-4 fw-semibold text-white">{car.name}</h1>
          <div className="text-white-50">
            Ano {car.year} • {car.type.replace(/_/g, " ")}
          </div>
          <div className="d-flex align-items-center gap-3 mt-4">
            <div className="price-tag">${formatCurrency(car.price)}</div>
            <button
              className={`btn ${car.is_favorite ? "btn-light" : "btn-outline-light"}`}
              onClick={handleFavorite}
            >
              {car.is_favorite ? "Remover favorito" : "Favoritar"} ({car.favorite_count})
            </button>
          </div>
        </div>
      </div>
      <div className="container car-detail-content">
        {statusMessage && (
          <div className="alert alert-info" role="alert">
            {statusMessage}
          </div>
        )}
        <div className="row g-4">
          <div className="col-lg-8">
            <section className="car-description card shadow-sm">
              <div className="card-body">
                <h2 className="h4 fw-semibold mb-3">Descrição</h2>
                <p className="text-muted">{car.description || "Sem descrição cadastrada."}</p>
              </div>
            </section>
            <section className="car-comments card shadow-sm mt-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="h4 fw-semibold mb-0">Comentários</h2>
                  <span className="badge bg-primary badge-pill">{car.comment_count} no total</span>
                </div>
                {user ? (
                  <form className="mb-4" onSubmit={handleCommentSubmit}>
                    <label htmlFor="comment" className="form-label fw-semibold">
                      Compartilhe sua opinião sobre este modelo
                    </label>
                    <textarea
                      id="comment"
                      className="form-control"
                      rows="3"
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                      placeholder="Escreva seu comentário"
                      required
                    />
                    <button className="btn btn-accent mt-3" type="submit" disabled={postingComment}>
                      {postingComment ? "Enviando..." : "Publicar comentário"}
                    </button>
                  </form>
                ) : (
                  <div className="alert alert-warning" role="alert">
                    Faça login para participar da discussão e deixar seus comentários.
                  </div>
                )}
                {commentsLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-muted">Ainda não há comentários. Seja o primeiro a compartilhar sua experiência!</p>
                ) : (
                  <CommentThread
                    comments={comments}
                    onReply={handleReply}
                    onLike={handleLike}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    currentUser={user}
                  />
                )}
              </div>
            </section>
          </div>
          <div className="col-lg-4">
            <section className="card shadow-sm">
              <div className="card-body">
                <h2 className="h5 fw-semibold mb-3">Ficha técnica</h2>
                <ul className="list-unstyled detail-list">
                  <li>
                    <span className="label">Marca</span>
                    <span>{car.brand}</span>
                  </li>
                  <li>
                    <span className="label">Modelo</span>
                    <span>{car.name}</span>
                  </li>
                  <li>
                    <span className="label">Ano</span>
                    <span>{car.year}</span>
                  </li>
                  <li>
                    <span className="label">Categoria</span>
                    <span>{car.type.replace(/_/g, " ")}</span>
                  </li>
                  <li>
                    <span className="label">Favoritos</span>
                    <span>{car.favorite_count}</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
