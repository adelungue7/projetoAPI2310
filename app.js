// ===== CONFIGURAÇÃO INICIAL =====
// Pegue sua chave gratuita em: http://www.omdbapi.com/apikey.aspx
const CHAVE_API = "12346006";
const URL_BASE = "https://www.omdbapi.com/";

// ===== CONEXÃO COM O HTML =====
const campoBusca = document.getElementById("campo-busca");
const listaResultados = document.getElementById("lista-resultados");
const mensagemStatus = document.getElementById("mensagem-status");

// ===== VARIÁVEIS DE CONTROLE =====
let termoBusca = "";      // Texto digitado pelo usuário
let paginaAtual = 1;      // Página de resultados (a API retorna 10 por página)

// ===== FUNÇÃO DO BOTÃO "BUSCAR" =====
function buscarFilmes() {
  termoBusca = campoBusca.value.trim(); // remove espaços extras
  paginaAtual = 1;                      // sempre começa da página 1
  pesquisarFilmes();                    // chama a função que faz a requisição
}

// ===== FUNÇÃO DO BOTÃO "PRÓXIMA PÁGINA" =====
function proximaPagina() {
  paginaAtual++;
  pesquisarFilmes();
}

// ===== FUNÇÃO DO BOTÃO "ANTERIOR" =====
function paginaAnterior() {
  if (paginaAtual > 1) {
    paginaAtual--;
    pesquisarFilmes();
  }
}

// ===== FUNÇÃO PRINCIPAL DE PESQUISA =====
async function pesquisarFilmes() {
  // Valida se o campo está vazio
  if (!termoBusca) {
    mensagemStatus.textContent = "Digite o nome de um filme para pesquisar.";
    listaResultados.innerHTML = "";
    return;
  }

  // Mostra mensagem de carregando
  mensagemStatus.textContent = "🔄 Buscando filmes, aguarde...";
  listaResultados.innerHTML = "";

  try {
    // Monta a URL com a chave e o termo buscado
    const url = `${URL_BASE}?apikey=${CHAVE_API}&s=${encodeURIComponent(termoBusca)}&page=${paginaAtual}`;
    alert(url);
    
    // Faz a chamada na API
    const resposta = await fetch(url);
    const dados = await resposta.json();

    // Verifica se encontrou algo
    if (dados.Response === "False") {
      mensagemStatus.textContent = "Nenhum resultado encontrado.";
      listaResultados.innerHTML = "";
      return;
    }

    // Mostra os filmes na tela
    exibirFilmes(dados.Search);
    mensagemStatus.textContent = `Página ${paginaAtual} — mostrando resultados para "${termoBusca}"`;

  } catch (erro) {
    console.error(erro);
    mensagemStatus.textContent = "❌ Erro ao buscar dados. Verifique sua conexão.";
  }
}

// ===== FUNÇÃO PARA MOSTRAR FILMES =====
function exibirFilmes(filmes) {
  listaResultados.innerHTML = ""; // limpa os resultados anteriores

  filmes.forEach(filme => {
    // Cria o container do card
    const div = document.createElement("div");
    div.classList.add("card");

    // Se não houver pôster, usa uma imagem padrão
    const poster = filme.Poster !== "N/A"
      ? filme.Poster
      : "https://via.placeholder.com/300x450?text=Sem+Poster";

    // Monta o HTML do card
    div.innerHTML = `
      <img src="${poster}" alt="Pôster do filme ${filme.Title}">
      <h3>${filme.Title}</h3>
      <p>Ano: ${filme.Year}</p>
    `;

    // Adiciona o card dentro da lista
    listaResultados.appendChild(div);
  });
}
