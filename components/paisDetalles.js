import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const CountryDetails = ({ countries}) => {
  const navigate = useNavigate();
  const params = useParams();
  const countryName = params.countryName;
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState({
    name: "",
    official: "",
    flagImg: "",
    population: 0,
    region: "",
    subregion: "",
    capital: "",
    currencies: {},
    languages: [],
    borders: [],
  });
  const url = "https://restcountries.com/v3.1/name/";
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const fetchData = await fetch(`${url}${countryName}`);
      const res = await fetchData.json();
      setCountry({
        ...country,
        name: res[0].name.common,
        official: res[0].name.official,
        flagImg: res[0].flags.png,
        population: res[0].population,
        region: res[0].region,
        subregion: res[0].subregion,
        capital: res[0].capital,
        currencies: res[0].currencies,
        languages: res[0].languages,
        borders: res[0].borders,
      });
      setLoading(false);
    };
    fetchData();
  }, [countryName]);

  let languages;
  languages = Object.values(country.languages);

  let borders = [];
  borders = country.borders;

  let currencies;
  currencies = Object.values(country.currencies);

  return loading ? (
    <div className={dark ? "loading dark" : "loading"}>Loading . . .</div>
  ) : (
    <div className={dark ? "country-details dark" : "country-details"}>
      <button
        className={dark ? "back-btn dark" : "back-btn"}
        onClick={() => navigate(-1)}
      >
        <BsArrowLeft />
        Back
      </button>
      <div className="country-details-body">
        <div className="img-container">
          <img src={country.flagImg} alt="Country Flag" />
        </div>
        <div className="country-details-content">
          <div className="country-details-name">
            <h1>{country.name}</h1>
          </div>
          <div className="country-details-info">
            <section>
              {/* <p>
                Native Name: <span>{nativeName}</span>
              </p> */}
              <p>
                Official Name: <span>{country.official}</span>
              </p>
              <p>
                Population: <span>{country.population}</span>
              </p>
              <p>
                Region: <span>{country.region}</span>
              </p>
              <p>
                Sub Region: <span>{country.subregion}</span>
              </p>
              <p>
                Capital: <span>{country.capital}</span>
              </p>
            </section>
            <section>
              <p>
                Currencies:{" "}
                <span>
                  {currencies?.map(
                    (currency, index) =>
                      currency.name +
                      `${index === currencies.length - 1 ? "" : " , "} `
                  )}
                </span>
              </p>
              <p>
                Languages:{" "}
                <span>
                  {languages?.map(
                    (language, index) =>
                      language +
                      `${index === languages.length - 1 ? "" : " , "} `
                  )}
                </span>
              </p>
            </section>
          </div>
          <div>
            <p>
              Borders:
              {borders !== undefined &&
                country.borders.map((border) => <span>{border}</span>)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default paisDetalle;