package br.com.sualoja.testes;

import java.math.BigDecimal;
import br.com.sualoja.dao.CategoriaDAO;
import br.com.sualoja.dao.FornecedorDAO;
import br.com.sualoja.dao.ProdutoDAO;
import br.com.sualoja.model.Categoria;
import br.com.sualoja.model.Fornecedor;
import br.com.sualoja.model.Produto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

// Este é o nosso "script" para a primeira carga de dados no sistema.
// ... imports

public class RegistroInicial {
    public static void main(String[] args) {
        EntityManagerFactory factory = Persistence.createEntityManagerFactory("loja-virtual");
        EntityManager em = factory.createEntityManager();
        
        // Criando os DAOs (assumindo que você criou as classes DAO básicas)
        ProdutoDAO produtoDao = new ProdutoDAO(em);
        UsuarioDAO usuarioDao = new UsuarioDAO(em);
        ClienteDAO clienteDao = new ClienteDAO(em);
        VendaDAO vendaDao = new VendaDAO(em); // Esse DAO só precisa do método cadastrar(Venda v)

        em.getTransaction().begin();

        // 1. Cadastrando um Usuário (Vendedor)
        Usuario vendedor = new Usuario("Kaik Lopes", "111.222.333-44", "kaik.dev", "senha123");
        usuarioDao.cadastrar(vendedor); 
        // O Hibernate salva em 'Pessoas' e depois em 'Usuarios' automaticamente!

        // 2. Cadastrando um Cliente
        Cliente cliente = new Cliente("Lucas Pereira", "999.888.777-66", "8399999-0000", "Rua do IFPB, Cajazeiras");
        clienteDao.cadastrar(cliente);

        // 3. Recuperando um Produto existente (exemplo: ID 1)
        // Se não tiver, crie um antes igual você fez na sua imagem
        Produto produto = produtoDao.buscarPorId(1L); 

        // 4. Realizando uma VENDA
        Venda venda = new Venda(cliente, vendedor);
        
        // Criando o item da venda (ex: 2 unidades do produto)
        VendaItem item = new VendaItem(produto, 2);
        
        // Adicionando item na venda (a venda calcula o total sozinha)
        venda.adicionarItem(item);

        // 5. Salvando a Venda (o Cascade salva os Itens automaticamente)
        vendaDao.cadastrar(venda);

        em.getTransaction().commit();
        
        System.out.println("Venda realizada com sucesso! ID: " + venda.getId());
        em.close();
    }
}