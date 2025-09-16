import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AuthContext from "../../context/AuthContext";
import Header from "../Header/Header";
import "./CarInventory.css";

const formatCurrency = (value) =>
  Number.isFinite(value) ? value.toLocaleString("en-US", { maximumFractionDigits: 0 }) : value;

const CarInventory = () => {
  const { user } = useContext(AuthContext);
  const [cars, setCars] = useState([]);
  const [availableFilters, setAvailableFilters] = useState({
    brands: [],
    years: [],
    price: { min: null, max: null },
  });
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const fetchCars = async () => {
      setLoading(true);
      setError("");
      setStatusMessage("");
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (brand) params.append("brand", brand);
      if (priceMin) params.append("price_min", priceMin);
      if (priceMax) params.append("price_max", priceMax);
      if (yearMin) params.append("year_min", yearMin);
      if (yearMax) params.append("year_max", yearMax);

      try {
        const response = await fetch(`/djangoapp/api/cars/?${params.toString()}`, {
          credentials: "include",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to load cars.");
        }
        setCars(data.cars);
        setAvailableFilters(data.filters);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
    return () => controller.abort();
  }, [search, brand, priceMin, priceMax, yearMin, yearMax]);

  const handleReset = () => {
    setSearch("");
    setBrand("");
    setYearMin("");
    setYearMax("");
    setPriceMin("");
    setPriceMax("");
  };

  const handleFavorite = async (carId) => {
    if (!user) {
      setStatusMessage("Faça login para favoritar carros da sua coleção.");
      return;
    }
    try {
      const response = await fetch(`/djangoapp/api/cars/${carId}/favorite/`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível atualizar o favorito.");
      }
      setCars((prev) =>
        prev.map((car) =>
          car.id === carId
            ? { ...car, is_favorite: data.favorited, favorite_count: data.favorites }
            : car
        )
      );
      setStatusMessage(data.favorited ? "Carro adicionado aos favoritos." : "Favorito removido.");
    } catch (err) {
      setStatusMessage(err.message);
    }
  };

  return (
    <div className="inventory-page">
      <Header />
      <div className="inventory-hero text-center text-white py-5">
        <div className="container">
          <h1 className="display-5 fw-semibold">Coleção exclusiva de carros de luxo</h1>
          <p className="lead text-white-50">
            Filtre por marca, ano ou faixa de preço para encontrar o veículo perfeito e acompanhe comentários da comunidade.
          </p>
        </div>
      </div>
      <div className="container inventory-container">
        <div className="row g-4">
          <div className="col-lg-3">
            <div className="filters-card">
              <h2 className="h5 fw-semibold mb-3">Filtros</h2>
              <div className="mb-3">
                <label className="form-label">Buscar</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Busque por modelo ou marca"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Marca</label>
                <select
                  className="form-select"
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                >
                  <option value="">Todas as marcas</option>
                  {availableFilters.brands.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Faixa de preço (USD)</label>
                <div className="d-flex gap-2">
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="mínimo"
                    value={priceMin}
                    onChange={(event) => setPriceMin(event.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="máximo"
                    value={priceMax}
                    onChange={(event) => setPriceMax(event.target.value)}
                  />
                </div>
                {Number.isFinite(availableFilters.price.min) && Number.isFinite(availableFilters.price.max) && (
                  <small className="text-muted">
                    Faixa disponível: ${formatCurrency(availableFilters.price.min)} - $
                    {formatCurrency(availableFilters.price.max)}
                  </small>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Ano</label>
                <div className="d-flex gap-2">
                  <select
                    className="form-select"
                    value={yearMin}
                    onChange={(event) => setYearMin(event.target.value)}
                  >
                    <option value="">De</option>
                    {availableFilters.years.map((item) => (
                      <option key={`min-${item}`} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <select
                    className="form-select"
                    value={yearMax}
                    onChange={(event) => setYearMax(event.target.value)}
                  >
                    <option value="">Até</option>
                    {availableFilters.years.map((item) => (
                      <option key={`max-${item}`} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="btn btn-outline-secondary w-100" onClick={handleReset}>
                Limpar filtros
              </button>
            </div>
          </div>
          <div className="col-lg-9">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            {statusMessage && !error && (
              <div className="alert alert-info" role="alert">
                {statusMessage}
              </div>
            )}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-3 text-muted">Carregando catálogo...</p>
              </div>
            ) : cars.length === 0 ? (
              <div className="empty-state">
                <h3>Nenhum veículo encontrado</h3>
                <p className="text-muted">
                  Ajuste os filtros de busca ou limpe os campos para visualizar toda a coleção de carros de luxo.
                </p>
              </div>
            ) : (
              <div className="row g-4">
                {cars.map((car) => (
                  <div className="col-md-6 col-xl-4" key={car.id}>
                    <div className="car-card h-100 d-flex flex-column">
                      <div className="car-card-image" style={{ backgroundImage: `url(${car.image_url})` }} />
                      <div className="car-card-body flex-grow-1 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="badge bg-dark text-uppercase">{car.brand}</span>
                          <span className="badge bg-secondary badge-pill">{car.year}</span>
                        </div>
                        <h3 className="h5 fw-semibold mb-1">{car.name}</h3>
                        <p className="text-muted mb-3">${formatCurrency(car.price)}</p>
                        <div className="mt-auto d-flex justify-content-between align-items-center">
                          <Link className="btn btn-outline-primary btn-sm" to={`/cars/${car.id}`}>
                            Ver detalhes
                          </Link>
                          <button
                            className={`btn btn-sm ${car.is_favorite ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => handleFavorite(car.id)}
                          >
                            {car.is_favorite ? "Favorito" : "Favoritar"} ({car.favorite_count})
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarInventory;
