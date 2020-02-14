import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { switchMap } from 'rxjs/operators';

import * as toastr from 'toastr';

import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';


@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.sass']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string
  entryForm: FormGroup
  pageTitle: string
  serverErrorMessages: string[] = null
  submitingForm: boolean = false
  entry: Entry = new Entry()

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {

    this.setCurrentAction()
    this.buildEntryForm()
    this.loadEntry()
  }
  
  ngAfterContentChecked(){
    this.setPageTitle()
  }

  submitForm(){
    this.submitingForm = true

    if(this.currentAction === "new"){
      this.createEntry()
    }else{
      this.updateEntry()
    }
  }

  //Private Methods
  private setCurrentAction(){
    this.route.snapshot.url[0].path === "new" ? this.currentAction = "new" : this.currentAction = "edit"
  }

  private buildEntryForm(){

    this.entryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
      type: [null, [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [null, [Validators.required]],
      categoryId: [null, [Validators.required]]

    })

  }

  private loadEntry(){
    if(this.currentAction === "edit"){
      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getById(+params.get("id")))
      )
      .subscribe(
        (entry) => {
          this.entry = entry
          this.entryForm.patchValue(this.entry)
        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde.')
      )
    }
  }

  private setPageTitle(){

    if(this.currentAction === "new"){
      this.pageTitle = "Cadastro de novo Lançamento"
    }else{
      this.pageTitle = `Editar Lançamento: ${this.entry.name || ""}`
    }
  }

  private createEntry(){
    const newEntry: Entry = Object.assign(new Entry(), this.entryForm.value)
    this.entryService.create(newEntry)
      .subscribe(
        entry => this.actionsForSuccess(entry),
        error => this.actionsForError(error)
      )
  }

  private updateEntry(){
    const updatedEntry: Entry = Object.assign(new Entry(), this.entryForm.value)

    this.entryService.update(updatedEntry)
      .subscribe(
        entry => this.actionsForSuccess(entry),
        error => this.actionsForError(this.entry)
      )
  }

  private actionsForSuccess(entry: Entry){
    toastr.success("Solicitação Processada com Sucesso!")

    //redirect and reload component page
    this.router.navigateByUrl("entries", {skipLocationChange: true}).then(
      () => this.router.navigate(["entries", entry.id, "edit"])
    )
  }

  private actionsForError(error){
    toastr.error("Ocorreu um Erro ao processar a sua solicitação!");
    this.submitingForm = false


    if(error.status === 422){
      this.serverErrorMessages = JSON.parse(error._body).errors //Adequar de acordo com a API de Backend utilizada
    }else{
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde"]
    }
  }

}
