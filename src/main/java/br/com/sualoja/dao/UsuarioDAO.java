package br.com.sualoja.dao;

import br.com.sualoja.model.Usuario;
import jakarta.persistence.EntityManager;

public class UsuarioDAO {

    private EntityManager em;

    public UsuarioDAO(EntityManager em) {
        this.em = em;
    }

    public void cadastrar(Usuario usuario) {
        this.em.persist(usuario);
    }

    public Usuario buscarPorId(Long id) {
        return this.em.find(Usuario.class, id);
    }
}