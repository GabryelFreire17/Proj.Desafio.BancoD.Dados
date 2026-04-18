import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CidadeService {
  private storageKey = 'cidades_db';

  constructor() { }

  
  listar(): Observable<any[]> {
    const dados = localStorage.getItem(this.storageKey);
    const cidades = dados ? JSON.parse(dados) : [];
    return of(cidades); 
  }

 
  salvar(cidade: any): Observable<any> {
    const cidades = this.listarArray();
    
   
    if (!cidade.id) {
      cidade.id = Math.floor(Math.random() * 1000);
    }

    cidades.push(cidade);
    localStorage.setItem(this.storageKey, JSON.stringify(cidades));
    return of(cidade);
  }

  
  excluir(id: number): Observable<void> {
    let cidades = this.listarArray();
    cidades = cidades.filter(c => c.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(cidades));
    return of(void 0);
  }

  
  private listarArray(): any[] {
    const dados = localStorage.getItem(this.storageKey);
    return dados ? JSON.parse(dados) : [];
  }
}
