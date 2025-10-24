const express = require('express');
const app = express();
app.use(express.json());

// banco em memoria
let produtos = [
    { id: 1, nome: 'Teclado', preco: 100 },
    { id: 2, nome: 'Mouse', preco: 50 },
]

app.get('/', (req, res) => res.status(200).send('API de Produtos funcionando!'));
app.listen(3000, () => console.log('Servidor rodando'));

// GET /produtos (lista todos)
app.get('/produtos', (req, res) => {
  res.status(200).json(produtos);
});

// GET /produtos/:id (busca por id)
app.get('/produtos/:id', (req, res) => {
  const id = Number(req.params.id);
  const produto = produtos.find(p => p.id === id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  res.status(200).json(produto);
});
