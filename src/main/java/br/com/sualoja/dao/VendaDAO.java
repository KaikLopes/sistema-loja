package br.com.sualoja.dao;

import br.com.sualoja.model.Venda;
import jakarta.persistence.EntityManager;

public class VendaDAO {

    private EntityManager em;

    public VendaDAO(EntityManager em) {
        this.em = em;
    }

    public void cadastrar(Venda venda) {
        this.em.persist(venda);
    }

    public Venda buscarPorId(Long id) {
        return this.em.find(Venda.class, id);
    }
}