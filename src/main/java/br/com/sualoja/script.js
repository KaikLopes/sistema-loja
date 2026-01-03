document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    document.getElementById('form-produto').addEventListener('submit', salvarProduto);
});

async function carregarProdutos() {
    const container = document.getElementById('lista-produtos');
    
    try {
        const resposta = await fetch('/api/produtos');
        const produtos = await resposta.json();

        container.innerHTML = ''; // Limpa o "Carregando..."

        produtos.forEach(produto => {
            const card = document.createElement('div');
            card.classList.add('card-produto');

            card.innerHTML = `
                <h3>${produto.nome}</h3>
                <p style="color: #27ae60; font-weight: bold; font-size: 1.2em;">R$ ${produto.precoVenda.toFixed(2)}</p>
                <p style="color: #7f8c8d;">Estoque: ${produto.quantidadeEstoque}</p>
                
                <div class="card-actions">
                    <button class="btn-edit" onclick="editarProduto(${produto.id}, '${produto.nome}', ${produto.precoVenda}, ${produto.quantidadeEstoque})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="deletarProduto(${produto.id})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (erro) {
        container.innerHTML = '<p>Erro ao carregar produtos.</p>';
        console.error(erro);
    }
}

async function salvarProduto(event) {
    event.preventDefault();

    const id = document.getElementById('prod-id').value;
    const produto = {
        id: id ? parseInt(id) : null,
        nome: document.getElementById('prod-nome').value,
        precoVenda: parseFloat(document.getElementById('prod-preco').value),
        quantidadeEstoque: parseInt(document.getElementById('prod-estoque').value)
        // Nota: Para simplificar, não estamos enviando Categoria/Fornecedor neste form básico
    };

    const metodo = id ? 'PUT' : 'POST';

    try {
        const resposta = await fetch('/api/produtos', {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto)
        });

        if (resposta.ok) {
            alert('Produto salvo com sucesso!');
            mostrarTela('lista');
            carregarProdutos();
        } else {
            alert('Erro ao salvar produto.');
        }
    } catch (erro) {
        console.error(erro);
        alert('Erro de conexão.');
    }
}

async function deletarProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
        await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
        carregarProdutos();
    } catch (erro) {
        console.error(erro);
        alert('Erro ao excluir.');
    }
}

function editarProduto(id, nome, preco, estoque) {
    document.getElementById('prod-id').value = id;
    document.getElementById('prod-nome').value = nome;
    document.getElementById('prod-preco').value = preco;
    document.getElementById('prod-estoque').value = estoque;
    
    mostrarTela('form');
}

function mostrarTela(tela) {
    // Esconde tudo
    document.getElementById('tela-lista').classList.add('hidden-section');
    document.getElementById('tela-lista').classList.remove('active-section');
    document.getElementById('tela-form').classList.add('hidden-section');
    document.getElementById('tela-form').classList.remove('active-section');

    // Mostra a desejada
    document.getElementById(`tela-${tela}`).classList.remove('hidden-section');
    document.getElementById(`tela-${tela}`).classList.add('active-section');

    if (tela === 'form' && !document.getElementById('prod-id').value) {
        document.getElementById('form-produto').reset();
        document.getElementById('prod-id').value = '';
    }
}