import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../shared/category.service';
import { Category } from '../shared/category.model';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.sass']
})
export class CategoryListComponent implements OnInit {

  categories: Category[] = []

  constructor(private service: CategoryService) { }

  ngOnInit() {
    this.service.getAll().subscribe( 
      categories => this.categories = categories,
      error => alert('Erro ao carregar a lista')
    )
  }

  deteteCategory(category){
    const mustDelete = confirm('Deseja realmente excluir este item?')

    if(mustDelete){
      this.service.delete(category.id).subscribe(
        () => this.categories = this.categories.filter(element => element !== category ),
        () => alert('Erro ao tentar exlcuir')
      )
    }
  }
}
