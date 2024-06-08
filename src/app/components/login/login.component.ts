import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { Login } from '../../interfaces/login';
import { UsuarioService } from '../../services/usuario.service';
import { UtilidadService } from '../../reutilizable/utilidad.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  formularioLogin: FormGroup;
  ocultarPassword: boolean = true
  mostrarLoading: boolean = false

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _usuarioService: UsuarioService,
    private _utilidadServicio: UtilidadService
  ) {
    this.formularioLogin = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    })
  }

  iniciarSesion() {
    this.mostrarLoading = true
    const request: Login = {
      correo: this.formularioLogin.value.email,
      clave: this.formularioLogin.value.password,
    }

    this._usuarioService.incicarSesion(request).subscribe({
      next: (data) => {
        if(data.status === true) {
          this._utilidadServicio.guardarSesionUsuario(data.value)
          this.router.navigate(["pages"])
        } else {
          this._utilidadServicio.mostrarAlerta("No se encontraron coincidencias", "Opps!")
        }
      },
      complete: () => {
        this.mostrarLoading = false
      },
      error: () => {
        this._utilidadServicio.mostrarAlerta("Hubo un error", "Opps!")
      }
    })
  }
}
