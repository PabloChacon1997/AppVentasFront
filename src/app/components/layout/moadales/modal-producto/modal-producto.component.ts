import { Component, Inject, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Categoria } from '../../../../interfaces/categoria';
import { Producto } from '../../../../interfaces/producto';
import { CategoriaService } from '../../../../services/categoria.service';
import { ProductoService } from '../../../../services/producto.service';
import { UtilidadService } from '../../../../reutilizable/utilidad.service';

@Component({
  selector: 'app-modal-producto',
  templateUrl: './modal-producto.component.html',
  styleUrl: './modal-producto.component.css'
})
export class ModalProductoComponent implements OnInit{
  formularioProducto: FormGroup
  tituloAccion: string = 'Agregar'
  botonAccion: string = 'Guardar'
  listaCategorias: Categoria[] = []

  listaEstado: any[] = [
    {value: 1, label: 'Activo'},
    {value: 2, label: 'Inactivo'},
  ]

  constructor(
    private modalActual: MatDialogRef<ModalProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public dataosProducto: Producto,
    private fb: FormBuilder,
    private _categoriaServicio: CategoriaService,
    private _productoServicio: ProductoService,
    private _utilidadServicio: UtilidadService
  ) {
    this.formularioProducto = this.fb.group({
      nombre: ['', Validators.required],
      idCategoria: ['', Validators.required],
      stock: ['', Validators.required],
      precio: ['', Validators.required],
      esActivo: [1, Validators.required],
    })

    
    if (this.dataosProducto !== null) {
      this.tituloAccion = 'Editar'
      this.botonAccion = 'Actualizar'
    }

    this._categoriaServicio.lista().subscribe({
      next: (data) => {
        if(data.status) this.listaCategorias = data.value
      },
      error: (e)=>{}
    })
  }

  ngOnInit(): void {
    if(this.dataosProducto !== null) {
      this.formularioProducto.patchValue({
        nombre: this.dataosProducto.nombre,
        idCategoria: this.dataosProducto.idCategoria,
        stock: this.dataosProducto.stock,
        precio: this.dataosProducto.precio,
        esActivo: this.dataosProducto.esActivo,
      })
    }
  }

  
  guardarEditar_Producto() {
    const _producto: Producto = {
      idProducto: this.dataosProducto == null ? 0:this.dataosProducto.idProducto, 
      nombre: this.formularioProducto.value.nombre, 
      idCategoria: this.formularioProducto.value.idCategoria,
      descripcionCategoria: '',
      precio: this.formularioProducto.value.precio,
      stock: this.formularioProducto.value.stock,
      esActivo: parseInt(this.formularioProducto.value.esActivo),
    }

    if(this.dataosProducto === null) {
      this._productoServicio.guardar(_producto).subscribe({
        next: (data) => {
          if(data.status) {
            this._utilidadServicio.mostrarAlerta('El usuario fue registrado', 'Exito')
            this.modalActual.close("true")
          } else {
            this._utilidadServicio.mostrarAlerta(data.msg, "Error")
          }
        },
        error: (e) => {}
      })
    } else {
      this._productoServicio.editar(_producto).subscribe({
        next: (data) => {
          if(data.status) {
            this._utilidadServicio.mostrarAlerta('El usuario fue actualizado', 'Exito')
            this.modalActual.close("true")
          } else {
            this._utilidadServicio.mostrarAlerta(data.msg, "Error")
          }
        },
        error: (e) => {}
      })
    }
  }

}
