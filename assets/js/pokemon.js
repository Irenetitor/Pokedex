const API_URL = "https://pokeapi.co/api/v2/pokemon";

export async function obtenerPrimeros151() {
  const respuestaLista = await fetch(`${API_URL}?limit=151`);
  if (!respuestaLista.ok) {
    throw new Error("Could not load the Pokémon list.");
  }

  const lista = await respuestaLista.json();

  return Promise.all(
    lista.results.map(async (elemento) => {
      const respuestaPokemon = await fetch(elemento.url);
      if (!respuestaPokemon.ok) {
        throw new Error(`Could not load data for ${elemento.name}.`);
      }
      return respuestaPokemon.json();
    }),
  );
}

export function crearTarjeta(pokemon) {
  const tarjeta = document.createElement("button");
  tarjeta.type = "button";
  tarjeta.className = "pokemon-card";
  tarjeta.setAttribute("aria-label", `View details for ${pokemon.name}`);
  tarjeta.dataset.pokemonId = pokemon.id;

  const marco = document.createElement("span");
  marco.className = "pokemon-card__media";

  const imagen = document.createElement("img");
  imagen.className = "pokemon-card__image";
  imagen.src =
    pokemon.sprites.other["official-artwork"].front_default ??
    pokemon.sprites.front_default ??
    "";
  imagen.alt = `Artwork of ${pokemon.name}`;
  imagen.loading = "lazy";

  const informacion = document.createElement("span");
  informacion.className = "pokemon-card__info";

  const numero = document.createElement("span");
  numero.className = "pokemon-card__number";
  numero.textContent = `No. ${String(pokemon.id).padStart(3, "0")}`;

  const nombre = document.createElement("span");
  nombre.className = "pokemon-card__name";
  nombre.textContent = pokemon.name;

  const tipos = document.createElement("span");
  tipos.className = "pokemon-card__types";
  pokemon.types.forEach(({ type }) => {
    const etiquetaTipo = document.createElement("span");
    etiquetaTipo.className = "pokemon-card__type";
    etiquetaTipo.textContent = type.name;
    tipos.append(etiquetaTipo);
  });

  informacion.append(numero, nombre, tipos);
  marco.append(imagen);
  tarjeta.append(marco, informacion);
  return tarjeta;
}

export function mostrarDetalles(pokemon, contenidoModal, modal) {
  contenidoModal.replaceChildren();

  const encabezado = document.createElement("div");
  encabezado.className = "pokemon-modal__header";

  const imagen = document.createElement("img");
  imagen.className = "pokemon-modal__image";
  imagen.src =
    pokemon.sprites.other["official-artwork"].front_default ??
    pokemon.sprites.front_default ??
    "";
  imagen.alt = `Artwork of ${pokemon.name}`;

  const datosPrincipales = document.createElement("div");
  const numero = document.createElement("p");
  numero.className = "pokemon-card__number";
  numero.textContent = `No. ${String(pokemon.id).padStart(3, "0")}`;

  const nombre = document.createElement("h2");
  nombre.id = "modal-name";
  nombre.className = "pokemon-modal__name";
  nombre.textContent = pokemon.name;

  const tipos = document.createElement("p");
  tipos.className = "pokemon-modal__types";
  tipos.textContent = `Type: ${pokemon.types.map(({ type }) => type.name).join(", ")}`;
  datosPrincipales.append(numero, nombre, tipos);
  encabezado.append(imagen, datosPrincipales);

  const tituloStats = document.createElement("h3");
  tituloStats.className = "pokemon-modal__section-title";
  tituloStats.textContent = "Stats";

  const listaStats = document.createElement("ul");
  listaStats.className = "pokemon-modal__stats";
  pokemon.stats.forEach(({ base_stat, stat }) => {
    const fila = document.createElement("li");
    fila.textContent = `${stat.name.replaceAll("-", " ")}: ${base_stat}`;
    listaStats.append(fila);
  });

  const datosFisicos = document.createElement("p");
  datosFisicos.className = "pokemon-modal__physical";
  datosFisicos.textContent = `Height: ${pokemon.height / 10} m · Weight: ${pokemon.weight / 10} kg`;

  contenidoModal.append(encabezado, tituloStats, listaStats, datosFisicos);
  modal.showModal();
}
