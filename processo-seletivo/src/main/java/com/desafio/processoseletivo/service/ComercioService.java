package com.desafio.processoseletivo.service;

import com.desafio.processoseletivo.model.Comercio;
import com.desafio.processoseletivo.model.TipoComercio;
import com.desafio.processoseletivo.model.Cidade;
import com.desafio.processoseletivo.model.dto.CommerceDTO;
import com.desafio.processoseletivo.repository.ComercioRepository;
import com.desafio.processoseletivo.repository.CidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComercioService {

    @Autowired
    private ComercioRepository repository;

    @Autowired
    private CidadeRepository cidadeRepository;

    public List<CommerceDTO> listarTodos() {
        return repository.findAll().stream()
                .map(comercio -> new CommerceDTO(comercio))
                .collect(Collectors.toList());
    }

    public CommerceDTO salvar(CommerceDTO dto) {
        TipoComercio tipoEnum = (dto.getTipoComercio() != null) ? TipoComercio.valueOf(dto.getTipoComercio()) : null;

        // Validação Unificada: Nome ou Tipo repetidos na mesma cidade
        boolean nomeExiste = repository.existsByNomeComercioAndCidadeId(dto.getNome(), dto.getCidadeId());
        boolean tipoExiste = (tipoEnum != null) && repository.existsByTipoAndCidadeId(tipoEnum, dto.getCidadeId());

        // Se for um novo cadastro (id null) OU se os dados existentes no banco forem diferentes do que está vindo no DTO
        if (dto.getId() == null) {
            validarDuplicidade(nomeExiste, tipoExiste, dto.getTipoComercio());
        } else {
            // Lógica para edição: só valida se o nome ou tipo mudaram para algo já existente
            Comercio comercioAtual = repository.findById(dto.getId()).orElse(null);
            if (comercioAtual != null) {
                if (!comercioAtual.getNomeComercio().equalsIgnoreCase(dto.getNome()) && nomeExiste) {
                    throw new RuntimeException("Este novo nome de comércio já está cadastrado nesta cidade!");
                }
                if (comercioAtual.getTipo() != tipoEnum && tipoExiste) {
                    throw new RuntimeException("Já existe um comércio do tipo " + dto.getTipoComercio() + " nesta cidade!");
                }
            }
        }

        Comercio comercio = new Comercio();
        comercio.setId(dto.getId());
        comercio.setNomeComercio(dto.getNome());
        comercio.setNomeResponsavel(dto.getNomeResponsavel());
        comercio.setTipo(tipoEnum);

        if (dto.getCidadeId() != null) {
            Cidade cidade = cidadeRepository.findById(dto.getCidadeId()).orElse(null);
            comercio.setCidade(cidade);
        }

        return new CommerceDTO(repository.save(comercio));
    }

   
    private void validarDuplicidade(boolean nomeExiste, boolean tipoExiste, String tipo) {
        if (nomeExiste) {
            throw new RuntimeException("Este nome de comércio já está cadastrado nesta cidade!");
        }
        if (tipoExiste) {
            throw new RuntimeException("Já existe um comércio do tipo " + tipo + " nesta cidade!");
        }
    }

    public void excluir(Long id) {
        repository.deleteById(id);
    }
}
