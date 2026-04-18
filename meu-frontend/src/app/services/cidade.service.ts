import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CidadeService {
  private storageKey = 'cidades_db';

  constructor() { }

  listar(): Observable<any[]> {
    const cidades = this.listarArray();
    return of(cidades);
  }

  salvar(cidade: any): Observable<any> {
    let cidades = this.listarArray();

    // 1. Validação: Impede criar ou editar cidade com nome que já existe
    const nomeDuplicado = cidades.find(c => 
      c.nome.toLowerCase() === cidade.nome.toLowerCase() && c.id !== cidade.id
    );

    if (nomeDuplicado) {
      // Retorna um erro caso o nome já exista
      alert('Erro: Já existe uma cidade cadastrada com este nome!');
      return throwError(() => new Error('Cidade duplicada'));
    }

    // 2. Lógica de Salvar ou Editar
    if (cidade.id) {
      // Edição: Substitui a cidade antiga pela nova na lista
      cidades = cidades.map(c => c.id === cidade.id ? cidade : c);
    } else {
      // Novo Cadastro: Gera ID e adiciona na lista
      cidade.id = Math.floor(Math.random() * 1000);
      cidades.push(cidade);
    }

    localStorage.setItem(this.storageKey, JSON.stringify(cidades));
    return of(cidade);
  }

  excluir(id: number): Observable<void> {
    let cidades = this.listarArray();
    cidades = cidades.filter(c => c.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(cidades));
    
    // Remover também os comércios vinculados a esta cidade
    const comerciosKey = 'comercios_db';
    const comercios = JSON.parse(localStorage.getItem(comerciosKey) || '[]');
    const comerciosFiltrados = comercios.filter((com: any) => com.cidadeId !== id);
    localStorage.setItem(comerciosKey, JSON.stringify(comerciosFiltrados));

    return of(void 0);
  }

  private listarArray(): any[] {
    const dados = localStorage.getItem(this.storageKey);
    return dados ? JSON.parse(dados) : [];
  }
}
