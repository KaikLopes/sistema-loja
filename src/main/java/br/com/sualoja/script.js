// Variáveis Globais
let modalProdutoInstancia;
let listaProdutosCache = [];

document.addEventListener('DOMContentLoaded', () => {
    modalProdutoInstancia = new bootstrap.Modal(document.getElementById('modalProduto'));
    
    // Toggle do Menu
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('wrapper').classList.toggle('toggled');
    });

    // Carrega a dashboard inicialmente
    carregarView('dashboard');
});

// --- Roteamento Simples ---
async function carregarView(view) {
    const container = document.getElementById('conteudo-principal');
    const titulo = document.getElementById('titulo-pagina');
    
    // Atualiza menu ativo
    document.querySelectorAll('.list-group-item').forEach(el => el.classList.remove('active-link', 'text-warning'));
    event?.target?.closest('a')?.classList.add('active-link', 'text-warning');

    if (view === 'dashboard') {
        titulo.innerText = 'Dashboard Financeiro';
        await renderizarDashboard(container);
    } else if (view === 'produtos') {
        titulo.innerText = 'Gerenciamento de Produtos';
        await renderizarListaProdutos(container);
    }
}

// --- Lógica da Dashboard ---
async function renderizarDashboard(container) {
    // Busca dados reais da API
    const produtos = await buscarDadosAPI(); 
    
    // Cálculos baseados nos dados
    const totalProdutos = produtos.length;
    const valorEstoque = produtos.reduce((acc, p) => acc + (p.precoVenda * p.quantidadeEstoque), 0);
    const estoqueBaixo = produtos.filter(p => p.quantidadeEstoque < 5).length;

    container.innerHTML = `
        <div class="row g-3">
            <div class="col-md-4">
                <div class="card p-3 shadow-sm border-start border-4 border-primary">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <p class="mb-1 text-muted">Total de Produtos</p>
                            <h3 class="fw-bold">${totalProdutos}</h3>
                        </div>
                        <i class="fas fa-box fa-2x text-primary opacity-50"></i>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card p-3 shadow-sm border-start border-4 border-success">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <p class="mb-1 text-muted">Valor em Estoque</p>
                            <h3 class="fw-bold">R$ ${valorEstoque.toFixed(2)}</h3>
                        </div>
                        <i class="fas fa-money-bill-wave fa-2x text-success opacity-50"></i>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card p-3 shadow-sm border-start border-4 border-danger">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <p class="mb-1 text-muted">Estoque Crítico</p>
                            <h3 class="fw-bold text-danger">${estoqueBaixo}</h3>
                        </div>
                        <i class="fas fa-exclamation-triangle fa-2x text-danger opacity-50"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-12">
                <div class="card shadow-sm">
                    <div class="card-header bg-white py-3">
                        <h5 class="mb-0">Produtos Recentes</h5>
                    </div>
                    <div class="card-body">
                         <p class="text-muted">Implementar gráfico ou tabela resumida aqui.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- Lógica de Produtos (Tabela) ---
async function renderizarListaProdutos(container) {
    const produtos = await buscarDadosAPI();
    listaProdutosCache = produtos; // Salva para filtro local

    let htmlTabela = `
        <div class="row mb-3">
            <div class="col-md-8">
                <input type="text" class="form-control" id="buscaProduto" placeholder="Buscar por nome..." onkeyup="filtrarTabelaLocal()">
            </div>
            <div class="col-md-4 text-end">
                <button class="btn btn-primary" onclick="abrirModal()">
                    <i class="fas fa-plus"></i> Novo
                </button>
            </div>
        </div>
        <div class="card shadow-sm">
            <div class="card-body p-0">
                <table class="table table-hover mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Nome</th>
                            <th>Preço</th>
                            <th>Estoque</th>
                            <th class="text-end">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-produtos">
                        ${gerarLinhasTabela(produtos)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    container.innerHTML = htmlTabela;
}

function gerarLinhasTabela(produtos) {
    if (produtos.length === 0) return '<tr><td colspan="4" class="text-center p-3">Nenhum produto encontrado.</td></tr>';
    
    return produtos.map(p => `
        <tr>
            <td class="align-middle fw-bold">${p.nome}</td>
            <td class="align-middle">R$ ${p.precoVenda.toFixed(2)}</td>
            <td class="align-middle">
                <span class="badge ${p.quantidadeEstoque < 5 ? 'bg-danger' : 'bg-success'}">
                    ${p.quantidadeEstoque} un
                </span>
            </td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editar(${p.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deletar(${p.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// --- Integração com API (Backend) ---
async function buscarDadosAPI() {
    try {
        const res = await fetch('/api/produtos');
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
}

async function salvarProduto() {
    const id = document.getElementById('prod-id').value;
    const produto = {
        nome: document.getElementById('prod-nome').value,
        precoVenda: parseFloat(document.getElementById('prod-preco').value),
        quantidadeEstoque: parseInt(document.getElementById('prod-estoque').value)
    };

    if (id) produto.id = id; // Se tiver ID, é update

    const method = id ? 'PUT' : 'POST';
    
    await fetch('/api/produtos', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto)
    });

    modalProdutoInstancia.hide();
    carregarView('produtos'); // Recarrega a tabela
}

async function deletar(id) {
    if(confirm('Remover este item?')) {
        await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
        carregarView('produtos');
    }
}

// --- Auxiliares ---
function filtrarTabelaLocal() {
    const termo = document.getElementById('buscaProduto').value.toLowerCase();
    const filtrados = listaProdutosCache.filter(p => p.nome.toLowerCase().includes(termo));
    document.getElementById('tbody-produtos').innerHTML = gerarLinhasTabela(filtrados);
}

function abrirModal() {
    document.getElementById('form-produto').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('modalTitulo').innerText = 'Novo Produto';
    modalProdutoInstancia.show();
}

function editar(id) {
    const p = listaProdutosCache.find(x => x.id === id);
    if(p) {
        document.getElementById('prod-id').value = p.id;
        document.getElementById('prod-nome').value = p.nome;
        document.getElementById('prod-preco').value = p.precoVenda;
        document.getElementById('prod-estoque').value = p.quantidadeEstoque;
        document.getElementById('modalTitulo').innerText = 'Editar Produto';
        modalProdutoInstancia.show();
    }
}