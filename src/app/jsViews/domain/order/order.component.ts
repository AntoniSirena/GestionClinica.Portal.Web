import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Iresponse } from '../../../interfaces/Iresponse/iresponse';
import { OrderDetailDTO } from '../../../models/domain/order';
import { OrderService } from '../../../services/domain/order.service';
import { OrderDetailItemDTO } from './../../../models/domain/order';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import { ICheckoutOrder, ICreateOrder } from './../../../interfaces/domain/order';
import { Router } from '@angular/router';
import $ from 'jquery';


@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {


  @ViewChild('buyArticle') buyArticleModal: ElementRef;
  @ViewChild('checkoutOrdenModal') checkoutOrdenModal: ElementRef;


  orderDetail = new OrderDetailDTO();
  currentArticle = new OrderDetailItemDTO();
  orderDetailEmpty: any;

  coreURL = environment.coreURL;

  currentArticleQuantity: number;
  itemNote: string;
  showButtonDeleteItem: boolean;

  address: string;


  constructor(
    private orderService: OrderService,
    private modalService: NgbModal,
    private routerService: Router,
  ) { }


  ngOnInit(): void {
    this.getShoppingCart();
  }


  getShoppingCart() {
    
    this.orderService.getShoppingCart().subscribe((response: Iresponse) => {

      this.orderDetail = response.Data;
      this.orderDetailEmpty = response.Message;

    },
      error => {
        console.log(JSON.stringify(error));
      });
  }


  addArticle(article: OrderDetailItemDTO, quantity: number, itemNote?: string) {

    if (!this.currentArticleQuantity) {
      Swal.fire({
        icon: 'warning',
        title: `Favor ingrese la cantidad que desea comprar`,
        showConfirmButton: true,
        timer: 6000
      }).then(() => {
      });

      return;
    }

    if (this.currentArticleQuantity < this.currentArticle.MinQuantity && this.currentArticle.MinQuantity) {
      Swal.fire({
        icon: 'warning',
        title: `La cantidad a comprar debe ser igual ó mayor a ${this.currentArticle.MinQuantity}`,
        showConfirmButton: true,
        timer: 6000
      }).then(() => {
      });

      return;
    }

    if (this.currentArticleQuantity > this.currentArticle.MaxQuantity && this.currentArticle.MaxQuantity) {
      Swal.fire({
        icon: 'warning',
        title: `La cantidad a comprar debe ser menor ó igual a ${this.currentArticle.MaxQuantity}`,
        showConfirmButton: true,
        timer: 6000
      }).then(() => {
      });

      return;
    }

    if (this.currentArticleQuantity > this.currentArticle.Stock && this.currentArticle.UseStock) {
      Swal.fire({
        icon: 'warning',
        title: `Este producto no tiene la cantidad suficiente para venderle ${this.currentArticleQuantity}. Existencia actual ${this.currentArticle.Stock}`,
        showConfirmButton: true,
        timer: 8000
      }).then(() => {
      });

      return;
    }

    const data: ICreateOrder = {
      ArticleId: article.ArticleId,
      Quantity: quantity,
      ItemNote: itemNote,
    }
    
    this.orderService.create(data).subscribe((response: Iresponse) => {
      
      if (response.Code === '000') {

        this.showButtonDeleteItem = response.Data.ShowButtonDeleteItem;

        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: response.Message,
          showConfirmButton: true,
          timer: 2000
        }).then(() => {
          this.getShoppingCart();
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: response.Message,
          showConfirmButton: true,
          timer: 7000
        }).then(() => {
        });
      }

    },
      error => {
        console.log(JSON.stringify(error));
      });

  }


  deleteArticle(article: OrderDetailItemDTO) {

    Swal.fire({
      title: 'Esta seguro que desea eliminar este artículo del carrito ?',
      text: "El mismo podra ser agregado nuevamente",
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!'
    }).then((result) => {
      if (result.value) {

        this.orderService.deleteArticle(article.ArticleId).subscribe((response: Iresponse) => {

          if (response.Code === '000') {

            this.modalService.dismissAll();

            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: response.Message,
              showConfirmButton: true,
              timer: 2000
            }).then(() => {
              this.getShoppingCart();
            });
          } else {
            Swal.fire({
              icon: 'warning',
              title: response.Message,
              showConfirmButton: true,
              timer: 7000
            }).then(() => {
            });
          }

        },
          error => {
            console.log(JSON.stringify(error));
          });

      }
    })

  }


  openModalAddArticle(article: OrderDetailItemDTO) {

    this.modalService.dismissAll();

    this.orderService.getCurrentArticleQuantity(article.ArticleId).subscribe((response: any) => {
      this.currentArticleQuantity = response.Quantity;
      this.showButtonDeleteItem = response.ShowButtonDeleteItem;
      this.itemNote = response.ItemNote;

      this.modalService.open(this.buyArticleModal, { size: 'sm-lg', scrollable: true, backdrop: 'static' });
      this.currentArticle = article;
    },
      error => {
        console.log(JSON.stringify(error));
      });

  }


  goToPortada(){
    this.routerService.navigate(['/portada']);
  }


  checkoutOrden(){
    
    if(!this.address){
      Swal.fire({
        icon: 'warning',
        title: "Favor ingrese la dirección donde desea recibir su orden",
        showConfirmButton: true,
        timer: 5000
      }).then(() => {
      });

      $('#address').addClass('address');

      return;
    }

    this.modalService.dismissAll();
    this.modalService.open(this.checkoutOrdenModal, { size: 'sm-lg', scrollable: true, backdrop: 'static' });

  }


  getPaymentMethod(paymentMethod: string, value: string){
    
    Swal.fire({
      title: `Esta seguro que desea pagar con ${value}?`,
      text: "El mismo no podra ser revertido",
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Volver atrás',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Confirmar!'
    }).then((result) => {
      if (result.value) {
        
        const data: ICheckoutOrder = {
          OrderId: this.orderDetail.Id,
          Address: this.address,
          PaymentMethod: paymentMethod,
        }

        this.orderService.Checkout(data).subscribe((response: Iresponse) => {
      
          if (response.Code === '000') {
      
            this.modalService.dismissAll();

            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: response.Message,
              showConfirmButton: true,
              timer: 2000
            }).then(() => {
              this.getShoppingCart();
            });
          } else {
            Swal.fire({
              icon: 'warning',
              title: response.Message,
              showConfirmButton: true,
              timer: 5000
            }).then(() => {
            });
          }
    
        },
          error => {
            console.log(JSON.stringify(error));
          });
        
      }
    })

  }


}
