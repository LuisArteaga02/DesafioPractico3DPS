import React from "react";

const Pais = ({
    nombre,
    capital,
    poblacion,
    bandera,
    region,
    mostrarDetalles,
    codigo,
}) => {
     const mostrarDetalleHandler = () =>{
    mostrarDetalles(codigo)
};
  return (
    <div
      onClick={mostrarDetalleHandler}
    >
      <picture>
        <img src={bandera} alt="Country Flag" />
      </picture>
      <section>
        <h2>{nombre}</h2>
        <p>
          <span className="country-info-highlight">Poblacion:</span>
          {poblacion}
        </p>
        <p>
          <span className="country-info-highlight"> Capital: </span>
          {capital}
        </p>
        <p>
          <span className="country-info-highlight">Region: </span>
          {region}
        </p>
      </section>
    </div>
  );
};

export default Pais;
