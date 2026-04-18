import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CidadeService } from '../../services/cidade.service';

@Component({
  selector: 'app-comercio-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, DropdownModule
  ],
  templateUrl: './comercio-list.html',
  styleUrl: './comercio-list.css'
})
export class ComercioList implements OnInit {
  comercios: any[] = [];
  cidades: any[] = [];
  exibirModal: boolean = false;
  private storageKey = 'comercios_db';

  tipos = [
    { label: 'Padaria', value: 'PADARIA' },
    { label: 'Farmácia', value: 'FARMACIA' },
    { label: 'Posto', value: 'POSTO_GASOLINA' },
    { label: 'Lanchonete', value: 'LANCHONETE' }
  ];

  novoComercio: any = { id: null, nome: '', nomeResponsavel: '', tipoComercio: '', cidadeId: null };

  constructor(private cidadeService: CidadeService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.listarTudo();
  }

  listarTudo() {
    this.cidadeService.listar().subscribe({
      next: (dados) => {
        this.cidades = dados;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar cidades', err)
    });
    const dados = localStorage.getItem(this.storageKey);
    this.comercios = dados ? JSON.parse(dados) : [];
    this.cd.detectChanges();
  }

  abrirModal() {
    this.novoComercio = { id: null, nome: '', nomeResponsavel: '', tipoComercio: '', cidadeId: null };
    this.exibirModal = true;
  }

  editar(comercio: any) {
    this.novoComercio = { ...comercio };
    this.exibirModal = true;
  }

  salvar() {
    if (!this.novoComercio.nome || !this.novoComercio.tipoComercio || !this.novoComercio.cidadeId) {
      alert('Preencha o nome, tipo e a cidade!');
      return;
    }

    // --- LÓGICA DE VALIDAÇÃO (FUSÃO DE REGRAS) ---
    const listaAtual = [...this.comercios];

    // Verifica se já existe outro comércio na MESMA cidade com o mesmo NOME ou MESMO TIPO
    const conflito = listaAtual.find(c => 
      c.cidadeId === this.novoComercio.cidadeId && 
      c.id !== this.novoComercio.id && // Ignora o próprio registro em caso de edição
      (c.nome.toLowerCase() === this.novoComercio.nome.toLowerCase() || c.tipoComercio === this.novoComercio.tipoComercio)
    );

    if (conflito) {
      const motivo = conflito.nome.toLowerCase() === this.novoComercio.nome.toLowerCase() ? 'nome' : 'tipo';
      alert(`Erro: Já existe um comércio com este ${motivo} nesta cidade!`);
      return;
    }
    // ---------------------------------------------

    let novaLista;
    if (this.novoComercio.id) {
      novaLista = listaAtual.map(c => c.id === this.novoComercio.id ? { ...this.novoComercio } : c);
    } else {
      this.novoComercio.id = Math.floor(Math.random() * 10000);
      novaLista = [...listaAtual, { ...this.novoComercio }];
    }

    localStorage.setItem(this.storageKey, JSON.stringify(novaLista));
    alert('Salvo com sucesso!');
    this.exibirModal = false;
    this.listarTudo();
  }

  excluirComercio(id: number) {
    if (confirm('Deseja excluir este comércio?')) {
      const listaAtual = this.comercios.filter(c => c.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(listaAtual));
      this.listarTudo();
    }
  }

  
  abrirModalCidade() {
    const nome = prompt('Digite o nome da nova cidade:');
    if (nome) {
      // Validação de cidade duplicada no front (antes de ir para o service)
      const cidadeExiste = this.cidades.some(c => c.nome.toLowerCase() === nome.toLowerCase());
      if (cidadeExiste) {
        alert('Esta cidade já está cadastrada!');
        return;
      }
      this.cidadeService.salvar({ nome }).subscribe(() => this.listarTudo());
    }
  }

  editarCidade(cidade: any) {
    const novoNome = prompt('Editar nome da cidade:', cidade.nome);
    if (novoNome && novoNome !== cidade.nome) {
      const cidadeExiste = this.cidades.some(c => c.nome.toLowerCase() === novoNome.toLowerCase());
      if (cidadeExiste) {
        alert('Já existe outra cidade com este nome!');
        return;
      }
      this.cidadeService.salvar({ id: cidade.id, nome: novoNome }).subscribe(() => this.listarTudo());
    }
  }

  excluirCidade(id: number) {
    if (confirm('Atenção: Isso excluirá a cidade e todos os seus comércios!')) {
      this.cidadeService.excluir(id).subscribe(() => this.listarTudo());
    }
  }
}
