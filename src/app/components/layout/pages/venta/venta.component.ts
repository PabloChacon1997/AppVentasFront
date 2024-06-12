import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

import { ProductoService } from '../../../../services/producto.service';
import { VentaService } from '../../../../services/venta.service'; 
import { UtilidadService } from '../../../../reutilizable/utilidad.service';

import { Producto } from '../../../../interfaces/producto';
import { Venta } from '../../../../interfaces/venta';
import { DetalleVenta } from '../../../../interfaces/detalle-venta';
import Swal from 'sweetalert2'


@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrl: './venta.component.css'
})
export class VentaComponent {
  listaProductos: Producto[] = []
  listaProductosFiltro: Producto[] = []

  listaProductosVenta: DetalleVenta[] = []
  bloquearBotonRegistrar: boolean = false

  productoSeleccionado!: Producto
  tipoPagoDefecto: string = 'Efectivo'
  totalPagar: number = 0

  formularioProductoVenta: FormGroup
  columnasTabla: string[] = ['producto', 'cantidad', 'precio','total','accion']
  datosDetalleVenta = new MatTableDataSource(this.listaProductosVenta)

  retornarProductosFiltro(busqueda: any): Producto[] {
    const valorBuscado = typeof busqueda === "string" ? busqueda.toLocaleLowerCase(): busqueda?.nombre?.toLocaleLowerCase()
    return this.listaProductos.filter(item => item.nombre.toLocaleLowerCase().includes(valorBuscado))
  }

  constructor(
    private fb: FormBuilder,
    private _productoServicio: ProductoService,
    private _ventaServicio: VentaService,
    private _utilidadServicio: UtilidadService,
  ){
    this.formularioProductoVenta = this.fb.group({
      producto: ['', Validators.required],
      cantidad: ['', Validators.required],
    })

    this._productoServicio.lista().subscribe({
      next: (data) => {
        if(data.status) {
          const lista = data.value as Producto[]
          this.listaProductos = lista.filter(p => p.esActivo === 1 && p.stock > 0)
        }
      },
      error: (e)=>{}
    })

    this.formularioProductoVenta.get('producto')?.valueChanges.subscribe(value => {
      this.listaProductosFiltro = this.retornarProductosFiltro(value)
    })
  }

  mostrarProducto(producto: Producto): string {
    return producto.nombre
  }

  productoVenta(event: any) {
    this.productoSeleccionado = event?.option?.value
  }
   agregarPorductoVenta() {
    const _cantidad: number = this.formularioProductoVenta.value?.cantidad
    const _precio: number = parseFloat(this.productoSeleccionado?.precio)
    const _total: number = _cantidad * _precio
    this.totalPagar = this.totalPagar + _total
    this.listaProductosVenta.push({
      idProducto: this.productoSeleccionado?.idProducto,
      descripcionProducto: this.productoSeleccionado?.nombre,
      cantidad: _cantidad,
      precioTexto: String(_precio.toFixed(2)),
      totalTexto: String(_total.toFixed(2)),
    })

    this.datosDetalleVenta = new MatTableDataSource(this.listaProductosVenta)
    this.formularioProductoVenta.patchValue({
      producto: '',
      cantidad: '',
    })
   }

   eliminarProducto(detalle: DetalleVenta) {
    this.totalPagar = this.totalPagar - parseFloat(detalle.totalTexto)
    this.listaProductosVenta = this.listaProductosVenta.filter(p => p.idProducto !== detalle.idProducto)
    this.datosDetalleVenta = new MatTableDataSource(this.listaProductosVenta)
   }

   registrarVenta() {
    if(this.listaProductosVenta.length> 0) {
      this.bloquearBotonRegistrar = true
      const request: Venta = {
        tipoPago: this.tipoPagoDefecto,
        totalTexto: String(this.totalPagar.toFixed(2)),
        detalleVenta: this.listaProductosVenta
      }

      this._ventaServicio.registrar(request).subscribe({
        next: (response) => {
          if(response.status) {
            this.totalPagar = 0
            this.listaProductosVenta = []
            this.datosDetalleVenta = new MatTableDataSource(this.listaProductosVenta)

            Swal.fire({
              icon: 'success',
              title: 'Venta registrada!',
              text: `Número de venta: ${response.value.numeroDocumento}`,
            })
          } else {
            this._utilidadServicio.mostrarAlerta(response.msg, 'Oops!')
          }
        },
        complete: () => {
          this.bloquearBotonRegistrar = false
        },
        error: (e) => {}
      })
    }
   }
}
