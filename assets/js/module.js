import {
  crearTarjeta,
  mostrarDetalles,
  obtenerPrimeros151,
} from "./pokemon.js";

const POKEMON_POR_PAGINA = 15;
const MENSAJE_INICIAL = "Pick a Pokémon to discover its type, stats, and more.";
const buscador = document.getElementById("buscador");
const tablero = document.getElementById("tablero");
const estado = document.getElementById("estado");
const etiquetaPagina = document.getElementById("pagina-actual");
const botonPaginaAnterior = document.getElementById("pagina-anterior");
const botonPaginaSiguiente = document.getElementById("pagina-siguiente");
const modal = document.getElementById("pokemon-modal");
const contenidoModal = document.getElementById("modal-content");
const botonCerrarModal = document.querySelector(".pokemon-modal__close");

async function iniciarPokedex() {
  try {
    estado.textContent = "Loading Pokémon...";

    const pokemons = await obtenerPrimeros151();
    const pokemonsPorId = new Map(
      pokemons.map((pokemon) => [pokemon.id, pokemon]),
    );
    const tarjetas = pokemons.map(crearTarjeta);
    let tarjetasVisibles = tarjetas;
    let totalPaginas = Math.ceil(tarjetasVisibles.length / POKEMON_POR_PAGINA);
    let paginaActual = 1;

    function mostrarPagina() {
      const inicio = (paginaActual - 1) * POKEMON_POR_PAGINA;
      const tarjetasPagina = tarjetasVisibles.slice(
        inicio,
        inicio + POKEMON_POR_PAGINA,
      );

      tablero.replaceChildren(...tarjetasPagina);
      etiquetaPagina.textContent = totalPaginas
        ? `Page ${paginaActual} of ${totalPaginas}`
        : "";
      estado.textContent = tarjetasVisibles.length
        ? MENSAJE_INICIAL
        : "No Pokémon found. Try another name or number.";
      botonPaginaAnterior.disabled = paginaActual <= 1;
      botonPaginaSiguiente.disabled = paginaActual >= totalPaginas;
    }

    mostrarPagina();

    buscador.addEventListener("input", () => {
      const busqueda = buscador.value.trim().toLowerCase();
      tarjetasVisibles = tarjetas.filter((_, indice) => {
        const { id, name } = pokemons[indice];
        return name.includes(busqueda) || Number(busqueda) === id;
      });
      totalPaginas = Math.ceil(tarjetasVisibles.length / POKEMON_POR_PAGINA);
      paginaActual = 1;
      mostrarPagina();
    });

    botonPaginaAnterior.addEventListener("click", () => {
      if (paginaActual > 1) {
        paginaActual -= 1;
        mostrarPagina();
      }
    });

    botonPaginaSiguiente.addEventListener("click", () => {
      if (paginaActual < totalPaginas) {
        paginaActual += 1;
        mostrarPagina();
      }
    });

    tablero.addEventListener("click", (evento) => {
      const tarjeta = evento.target.closest("[data-pokemon-id]");
      if (!tarjeta) return;

      const pokemon = pokemonsPorId.get(Number(tarjeta.dataset.pokemonId));
      mostrarDetalles(pokemon, contenidoModal, modal);
    });
  } catch (error) {
    estado.textContent =
      "Could not load Pokémon. Check your connection and reload the page.";
    botonPaginaAnterior.disabled = true;
    botonPaginaSiguiente.disabled = true;
    console.error(error);
  }
}

buscador.form.addEventListener("submit", (evento) => evento.preventDefault());

botonCerrarModal.addEventListener("click", () => modal.close());

modal.addEventListener("click", (evento) => {
  if (evento.target === modal) modal.close();
});

iniciarPokedex();
