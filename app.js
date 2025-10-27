// ===== CONFIGURAÇÃO INICIAL =====
// Pegue sua chave gratuita em: http://www.omdbapi.com/apikey.aspx
const CHAVE_API = "12346006";
const URL_BASE = "https://www.omdbapi.com/";

// ===== CONFIGURAÇÃO TMDb (para dados de atores) =====
// Pegue uma chave gratuita em: https://www.themoviedb.org/settings/api
// Substitua o valor abaixo pela sua chave. Se deixar em branco, a busca por atores mostrará instrução.
const TMDB_API_KEY = "d058b2f7067ea2a07cd74e0c7ee817f2";
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w300";

// ===== CONEXÃO COM O HTML =====
const campoBusca = document.getElementById("campo-busca");
const listaResultados = document.getElementById("lista-resultados");
const mensagemStatus = document.getElementById("mensagem-status");
const campoAtor = document.getElementById("campo-ator");
const listaAtores = document.getElementById("lista-atores");
const mensagemAtorStatus = document.getElementById("mensagem-ator-status");

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

// ===== BUSCA E EXIBIÇÃO DE ATORES (TMDb) =====
function buscarAtores() {
  const termo = campoAtor ? campoAtor.value.trim() : "";
  if (!campoAtor) return;
  if (!termo) {
    mensagemAtorStatus.textContent = "Digite o nome de um ator ou atriz para pesquisar.";
    listaAtores.innerHTML = "";
    return;
  }

  pesquisarAtores(termo);
}

async function pesquisarAtores(termo) {
  // Verifica se a chave TMDb foi configurada
  if (!TMDB_API_KEY || TMDB_API_KEY === "COLOQUE_SUA_TMDB_KEY_AQUI") {
    mensagemAtorStatus.textContent = "⚠️ Configure sua chave TMDb em app.js (TMDB_API_KEY) para usar a busca por atores.";
    return;
  }

  mensagemAtorStatus.textContent = "🔄 Buscando atores, aguarde...";
  listaAtores.innerHTML = "";

  try {
    const url = `${TMDB_BASE}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(termo)}&page=1&language=pt-BR`;
    const resp = await fetch(url);
    const dados = await resp.json();

    if (!dados || !dados.results || dados.results.length === 0) {
      mensagemAtorStatus.textContent = "Nenhum ator encontrado.";
      return;
    }

    exibirAtores(dados.results);
    mensagemAtorStatus.textContent = `Mostrando resultados para "${termo}"`;

  } catch (err) {
    console.error(err);
    mensagemAtorStatus.textContent = "❌ Erro ao buscar atores.";
  }
}

function exibirAtores(atores) {
  listaAtores.innerHTML = "";

  atores.forEach(ator => {
    const div = document.createElement('div');
    div.classList.add('card');

    const foto = ator.profile_path ? `${TMDB_IMAGE_BASE}${ator.profile_path}` : 'https://via.placeholder.com/300x450?text=Sem+Foto';

    // known_for pode ser um array com filmes/series — tentamos extrair títulos
    const conhecidos = (ator.known_for || []).map(k => k.title || k.name).filter(Boolean).slice(0,3).join(', ');

    div.innerHTML = `
      <img src="${foto}" alt="Foto de ${ator.name}">
      <h3>${ator.name}</h3>
      <p>${conhecidos ? 'Conhecido por: ' + conhecidos : ''}</p>
    `;

    // Clique abre detalhes
    div.style.cursor = 'pointer';
    div.addEventListener('click', () => verDetalhesAtor(ator.id));

    listaAtores.appendChild(div);
  });
}

// Exibe modal simples com detalhes do ator e créditos de filmes
async function verDetalhesAtor(atorId) {
  if (!TMDB_API_KEY || TMDB_API_KEY === "COLOQUE_SUA_TMDB_KEY_AQUI") {
    mensagemAtorStatus.textContent = "⚠️ Configure sua chave TMDb em app.js (TMDB_API_KEY) para ver detalhes.";
    return;
  }

  try {
    mensagemAtorStatus.textContent = "🔄 Carregando detalhes...";

    const detalhesUrl = `${TMDB_BASE}/person/${atorId}?api_key=${TMDB_API_KEY}&language=pt-BR`;
    const creditsUrl = `${TMDB_BASE}/person/${atorId}/movie_credits?api_key=${TMDB_API_KEY}&language=pt-BR`;

    const [respDet, respCred] = await Promise.all([fetch(detalhesUrl), fetch(creditsUrl)]);
    const det = await respDet.json();
    const cred = await respCred.json();

    // Monta modal
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    const modal = document.createElement('div');
    modal.classList.add('modal');

    const foto = det.profile_path ? `${TMDB_IMAGE_BASE}${det.profile_path}` : 'https://via.placeholder.com/300x450?text=Sem+Foto';

    // Lista de filmes — combinar cast e crew, remover duplicatas e ordenar por data (mais recentes primeiro)
    const todosCred = [ ...(cred.cast || []), ...(cred.crew || []) ];
    const uniqueMap = {};
    todosCred.forEach(f => {
      if (!f || !f.id) return;
      // manter o primeiro encontrado para cada id
      if (!uniqueMap[f.id]) uniqueMap[f.id] = f;
    });
    const filmesArray = Object.values(uniqueMap);
    filmesArray.sort((a, b) => {
      const dataA = (a.release_date || a.first_air_date || '');
      const dataB = (b.release_date || b.first_air_date || '');
      // datas no formato YYYY-MM-DD — comparar como strings funciona para ordenar
      if (!dataA && !dataB) return 0;
      if (!dataA) return 1; // sem data vão pro final
      if (!dataB) return -1;
      return dataB.localeCompare(dataA); // descendente
    });
    const filmes = filmesArray.map(f => `
      <li>${(f.title || f.name || '—')} (${(f.release_date || f.first_air_date || '—').slice(0,4)})</li>
    `).join('');

    modal.innerHTML = `
      <button class="modal-close">Fechar ✖</button>
      <div class="modal-body">
        <img src="${foto}" alt="Foto de ${det.name}">
        <div class="modal-info">
          <h2>${det.name}</h2>
          <p><strong>Nascimento:</strong> ${det.birthday || '—'}</p>
          <p><strong>Local:</strong> ${det.place_of_birth || '—'}</p>
          <p>${det.biography ? det.biography.slice(0,600) + (det.biography.length>600? '...':'') : 'Sem biografia disponível.'}</p>
          <h3>Todos os filmes</h3>
          <ul class="filmes-lista">${filmes || '<li>Nenhum crédito encontrado.</li>'}</ul>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Fechar
    modal.querySelector('.modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    mensagemAtorStatus.textContent = "";

  } catch (err) {
    console.error(err);
    mensagemAtorStatus.textContent = "❌ Erro ao carregar detalhes do ator.";
  }
}
