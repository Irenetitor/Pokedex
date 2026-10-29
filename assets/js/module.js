import {
  crearTarjeta,
  mostrarDetalles,
  obtenerListaPokemon,
  obtenerPokemon,
} from "./pokemon.js";

const POKEMON_POR_PAGINA = 15;
const RETRASO_BUSQUEDA_MS = 250;
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

const pokemonsPorId = new Map();
const tarjetasPorId = new Map();

async function iniciarPokedex() {
  try {
    estado.textContent = "Loading Pokémon...";

    const lista = await obtenerListaPokemon();
    let resultados = lista;
    let totalPaginas = Math.ceil(resultados.length / POKEMON_POR_PAGINA);
    let paginaActual = 1;
    let temporizadorBusqueda;
    let ultimaCarga = 0;

    async function mostrarPagina() {
      const carga = ++ultimaCarga;
      const inicio = (paginaActual - 1) * POKEMON_POR_PAGINA;
      const paginaLista = resultados.slice(inicio, inicio + POKEMON_POR_PAGINA);

      etiquetaPagina.textContent = totalPaginas
        ? `Page ${paginaActual} of ${totalPaginas}`
        : "";
      botonPaginaAnterior.disabled = paginaActual <= 1;
      botonPaginaSiguiente.disabled = paginaActual >= totalPaginas;

      if (!paginaLista.length) {
        tablero.replaceChildren();
        estado.textContent = "No Pokémon found. Try another name or number.";
        return;
      }

      estado.textContent = "Loading Pokémon...";

      try {
        const detalles = await Promise.all(
          paginaLista.map(({ id }) => obtenerPokemon(id)),
        );
        if (carga !== ultimaCarga) return;

        const tarjetas = detalles.map((pokemon) => {
          pokemonsPorId.set(pokemon.id, pokemon);
          if (!tarjetasPorId.has(pokemon.id)) {
            tarjetasPorId.set(pokemon.id, crearTarjeta(pokemon));
          }
          return tarjetasPorId.get(pokemon.id);
        });

        tablero.replaceChildren(...tarjetas);
        estado.textContent = MENSAJE_INICIAL;
      } catch (error) {
        if (carga !== ultimaCarga) return;
        estado.textContent =
          "Could not load these Pokémon. Check your connection and try again.";
        console.error(error);
      }
    }

    function cambiarPagina(pagina) {
      paginaActual = pagina;
      mostrarPagina();
    }

    botonPaginaAnterior.addEventListener("click", () => {
      if (paginaActual > 1) cambiarPagina(paginaActual - 1);
    });

    botonPaginaSiguiente.addEventListener("click", () => {
      if (paginaActual < totalPaginas) cambiarPagina(paginaActual + 1);
    });

    buscador.addEventListener("input", () => {
      clearTimeout(temporizadorBusqueda);
      temporizadorBusqueda = setTimeout(() => {
        const busqueda = buscador.value.trim().toLowerCase();
        resultados = lista.filter(
          ({ id, name }) => name.includes(busqueda) || Number(busqueda) === id,
        );
        totalPaginas = Math.ceil(resultados.length / POKEMON_POR_PAGINA);
        cambiarPagina(1);
      }, RETRASO_BUSQUEDA_MS);
    });

    tablero.addEventListener("click", (evento) => {
      const tarjeta = evento.target.closest("[data-pokemon-id]");
      if (!tarjeta) return;

      const pokemon = pokemonsPorId.get(Number(tarjeta.dataset.pokemonId));
      mostrarDetalles(pokemon, contenidoModal, modal);
    });

    await mostrarPagina();
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
