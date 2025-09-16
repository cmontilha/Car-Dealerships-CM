import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthContext from "../../context/AuthContext";
import Header from "../Header/Header";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const data = await refreshProfile();
        if (!data) {
          setError("Não foi possível carregar os dados do perfil.");
        } else {
          setProfileData(data);
        }
      } catch (err) {
        setError("Não foi possível carregar os dados do perfil.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, refreshProfile]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="app-loading d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  const favorites = profileData?.favorites || [];
  const comments = profileData?.comments || [];

  return (
    <div className="profile-page">
      <Header />
      <div className="container py-5">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <section className="profile-header card shadow-sm">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 fw-semibold mb-2">{profileData?.user?.full_name}</h1>
              <p className="text-muted mb-0">{profileData?.user?.email}</p>
              <p className="text-muted mb-0">@{profileData?.user?.username}</p>
            </div>
            <div className="d-flex gap-3">
              <div className="stat-card">
                <span className="stat-value">{favorites.length}</span>
                <span className="stat-label">Favoritos</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{comments.length}</span>
                <span className="stat-label">Comentários</span>
              </div>
            </div>
          </div>
        </section>

        <div className="row g-4 mt-4">
          <div className="col-lg-6">
            <section className="card shadow-sm h-100">
              <div className="card-body">
                <h2 className="h5 fw-semibold mb-3">Carros favoritados</h2>
                {favorites.length === 0 ? (
                  <p className="text-muted">Você ainda não adicionou carros à lista de favoritos.</p>
                ) : (
                  <div className="list-group list-group-flush">
                    {favorites.map((item) => (
                      <div className="list-group-item px-0" key={item.id}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h3 className="h6 mb-1">{item.brand} {item.name}</h3>
                            <p className="text-muted mb-1">Ano {item.year}</p>
                            <small className="text-muted">Adicionado em {new Date(item.favorite_since).toLocaleDateString()}</small>
                          </div>
                          <Link className="btn btn-outline-primary btn-sm" to={`/cars/${item.id}`}>
                            Ver detalhes
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
          <div className="col-lg-6">
            <section className="card shadow-sm h-100">
              <div className="card-body">
                <h2 className="h5 fw-semibold mb-3">Histórico de comentários</h2>
                {comments.length === 0 ? (
                  <p className="text-muted">Você ainda não comentou nenhum veículo.</p>
                ) : (
                  <div className="list-group list-group-flush">
                    {comments.map((item) => (
                      <div className="list-group-item px-0" key={item.id}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h3 className="h6 mb-1">{item.car.brand} {item.car.name}</h3>
                            <p className="mb-1 comment-preview">{item.content}</p>
                            <small className="text-muted">{new Date(item.created_at).toLocaleString()}</small>
                          </div>
                          <Link className="btn btn-outline-primary btn-sm" to={`/cars/${item.car.id}`}>
                            Ver carro
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
