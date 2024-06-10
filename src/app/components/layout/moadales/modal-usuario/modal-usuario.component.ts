import { Component, Inject, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Rol } from '../../../../interfaces/rol';
import { Usuario } from '../../../../interfaces/usuario';
import { RolService } from '../../../../services/rol.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { UtilidadService } from '../../../../reutilizable/utilidad.service';

@Component({
  selector: 'app-modal-usuario',
  templateUrl: './modal-usuario.component.html',
  styleUrl: './modal-usuario.component.css'
})
export class ModalUsuarioComponent  implements OnInit{
  
  formularioUsuario: FormGroup
  ocultarPassword: boolean = true
  tituloAccion: string = 'Agregar'
  botonAccion: string = 'Guardar'
  listaRoles: Rol[] = []

  listaEstado: any[] = [
    {value: 1, label: 'Activo'},
    {value: 2, label: 'Inactivo'},
  ]

  constructor(
    private modalActual: MatDialogRef<ModalUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public dataosUsuario: Usuario,
    private fb: FormBuilder,
    private _rolsServicio: RolService,
    private _usuarioServicio: UsuarioService,
    private _utilidadServicio: UtilidadService,
  ) {
    this.formularioUsuario = this.fb.group({
      nombreCompleto: ['', Validators.required],
      correo: ['',Validators.required],
      idRol: ['', Validators.required],
      clave: ['',Validators.required],
      esActivo: [1, Validators.required],
    })

    if (this.dataosUsuario !== null) {
      this.tituloAccion = 'Editar'
      this.botonAccion = 'Actualizar'
    }

    this._rolsServicio.lista().subscribe({
      next: (data) => {
        if(data.status) this.listaRoles = data.value
      },
      error: (e)=>{}
    })

  }
  ngOnInit(): void {
    if(this.dataosUsuario !== null) {
      console.log(this.dataosUsuario)
      this.formularioUsuario.patchValue({
        nombreCompleto: this.dataosUsuario.nombreCompleto ,
        correo: this.dataosUsuario.correo,
        idRol: this.dataosUsuario.idRol,
        clave: this.dataosUsuario.clave,
        esActivo: this.dataosUsuario.esActivo,
      })
    }
  }

  guardarEditar_usuario() {
    const _usuario: Usuario = {
      idUsuario: this.dataosUsuario == null ? 0:this.dataosUsuario.idUsuario, 
      nombreCompleto: this.formularioUsuario.value.nombreCompleto, 
      correo: this.formularioUsuario.value.correo,
      idRol: this.formularioUsuario.value.idRol,
      rolDescripcion: '',
      clave: this.formularioUsuario.value.clave,
      esActivo: parseInt(this.formularioUsuario.value.esActivo),
    }

    if(this.dataosUsuario === null) {
      this._usuarioServicio.guardar(_usuario).subscribe({
        next: (data) => {
          if(data.status) {
            this._utilidadServicio.mostrarAlerta('El usuario fue registrado', 'Exito')
            this.modalActual.close("true")
          } else {
            this._utilidadServicio.mostrarAlerta('No se pudo registrar el usuario', "Error")
          }
        },
        error: (e) => {}
      })
    } else {
      this._usuarioServicio.editar(_usuario).subscribe({
        next: (data) => {
          console.log(data)
          if(data.status) {
            this._utilidadServicio.mostrarAlerta('El usuario fue editado', 'Exito')
            this.modalActual.close("true")
          } else {
            this._utilidadServicio.mostrarAlerta('No se pudo editar el usuario', "Error")
          }
        },
        error: (e) => {}
      })
    }
  }

}
