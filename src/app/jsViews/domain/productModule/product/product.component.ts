import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Iproduct } from '../../../../interfaces/domain/iproduct';
import { Product, ProductModel } from '../../../../models/domain/product';
import { ProductService } from '../../../../services/domain/product/product.service';
import Swal from 'sweetalert2';
import { Iresponse } from '../../../../interfaces/Iresponse/iresponse';
import * as XLSX from 'ts-xlsx';
import { NgxSpinnerService } from 'ngx-spinner';
import { User } from '../../../../models/profile/profile';
import { BaseService } from '../../../../services/base/base.service';
import { ObjetPaginated } from '../../../../models/common/pagination';


@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {


  @ViewChild('createModal') createModal: ElementRef;
  @ViewChild('editModal') editModal: ElementRef;
  @ViewChild('excelProductModal') excelProductModal: ElementRef;



  createForm: FormGroup;
  editForm: FormGroup;

  _currentPage: number = 1;

  arrayBuffer: any;
  file: File;
  excelProducts: any;

  //Permissions
  canCreate: boolean = true;
  canEdit: boolean = true;
  canDelete: boolean = true;

  loadingMessage: string;

  products = new Array<Product>();
  productModel = new ProductModel;
  filter: string;
  objetPaginated: ObjetPaginated;

  userData = new User();

  constructor(
    private productService: ProductService,
    private modalService: NgbModal,
    private form: FormBuilder,
    private spinnerService: NgxSpinnerService,
    private baseService: BaseService,
  ) { }


  ngOnInit(): void {
    this.getProductsPaginated();
    this.userData = this.baseService.getUserData();
  }


  //Import excel file
  incomingfile(event) {
    this.file = event.target.files[0];
  }

  uploadExcel() {

    if(!this.file){
      Swal.fire({
        icon: 'warning',
        title: 'Favor seleccione el listado de productos para continuar',
        showConfirmButton: true,
        timer: 5000
      });
      return;
    }

    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      this.excelProducts = XLSX.utils.sheet_to_json(worksheet, { raw: true });
    }
    fileReader.readAsArrayBuffer(this.file);

    this.modalService.open(this.excelProductModal, { size: 'xl', backdrop: 'static', scrollable: true });

  }


  getProductsPaginated() {
    this.spinnerService.show();
    this.loadingMessage = 'Cargando...';
    this.filter = '';

    this.productService.getProducts_Paginated().subscribe((response: Iresponse) => {
      this.spinnerService.hide();
      this.objetPaginated = response.Data;
      this.products = this.objetPaginated.Records;    
    },
      error => {
        this.spinnerService.hide();
        console.log(JSON.stringify(error));
      });
  }

  _getProductsPaginated(numberPage: number) {
    this.productService.getProducts_Paginated(numberPage, this.filter).subscribe((response: Iresponse) => {
      if (response.Data?.Pagination) {
        this.objetPaginated = response.Data;
        this.products = this.objetPaginated.Records;
      } else {
        this.products = response.Data;
      }
    },
      error => {
        console.log(JSON.stringify(error));
      });

  }
  

  getById(id: number) {
    this.productService.getById(id).subscribe((response: ProductModel) => {
      this.productModel = response;

      //llenando el modal
      this.editForm = this.form.group({
        description: [this.productModel.Description, Validators.required],
        externalCode: [this.productModel.ExternalCode, Validators.required],
        barCode: [this.productModel.BarCode],
        cost: [this.productModel.Cost, Validators.required],
        price: [this.productModel.Price, Validators.required],
        reference: [this.productModel.Reference],
        existence: [this.productModel.Existence],
      });

      this.modalService.open(this.editModal, { size: 'lg', backdrop: 'static', scrollable: true });

    },
      error => {
        console.log(JSON.stringify(error));
      });
  }



  //open create modal
  openCreateModal() {
    this.initCreateFrom();
    this.modalService.open(this.createModal, { size: 'lg', backdrop: 'static', scrollable: true });
  }

  //open edit modal
  openEditModal(id: number) {
    this.initEditFrom();
    this.getById(id);
  }


  //Upload products
  uploadProducts() {

    Swal.fire({
      title: 'Esta seguro que desea guardar los producto ?',
      text: "Los cambios podran ser revertidos!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar!'
    }).then((result) => {
      if (result.value) {

        this.spinnerService.show();
        this.loadingMessage = 'Guardando items';
    
        this.productService.uploadProducts(this.excelProducts).subscribe((response: Iresponse) => {
          this.spinnerService.hide();
    
          if (response.Code === '000') {
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: response.Message,
              showConfirmButton: true,
              timer: 2000
            }).then(() => {
              this.getProductsPaginated();
              this.modalService.dismissAll();
            });
          } else {
            Swal.fire({
              icon: 'warning',
              title: response.Message,
              showConfirmButton: true,
              timer: 5000
            });
          }
        },
          error => {
            this.spinnerService.hide();
            console.log(JSON.stringify(error));
          });

      }
    })

  }


  //create
  create(form: any) {

    const data: Iproduct = {
      Id: 0,
      Description: form.description,
      FormattedDescription: form.formattedDescription,
      ExternalCode: form.externalCode,
      BarCode: form.barCode,
      Cost: form.cost,
      Price: form.price,
      Reference: form.reference,
      Existence: form.existence,
      CreatorUserId: null,
      CreationTime: null,
      LastModifierUserId: null,
      LastModificationTime: null,
      DeleterUserId: null,
      DeletionTime: null,
      IsActive: true,
      IsDeleted: false
    };

    this.productService.create(data).subscribe((response: Iresponse) => {
      if (response.Code === '000') {
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: response.Message,
          showConfirmButton: true,
          timer: 2000
        }).then(() => {
          this.getProductsPaginated();
          this.modalService.dismissAll();
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: response.Message,
          showConfirmButton: true,
          timer: 5000
        });
      }
    },
      error => {
        console.log(JSON.stringify(error));
      });

  }


  //edit
  edit(form: any) {

    const data: Iproduct = {
      Id: this.productModel.Id,
      Description: form.description,
      FormattedDescription: form.formattedDescription,
      ExternalCode: form.externalCode,
      BarCode: form.barCode,
      Cost: form.cost,
      Price: form.price,
      Reference: form.reference,
      Existence: form.existence,
      CreatorUserId: this.productModel.CreatorUserId,
      CreationTime: this.productModel.CreationTime,
      LastModifierUserId: this.productModel.LastModifierUserId,
      LastModificationTime: this.productModel.LastModificationTime,
      DeleterUserId: this.productModel.DeleterUserId,
      DeletionTime: this.productModel.DeletionTime,
      IsActive: this.productModel.IsActive,
      IsDeleted: this.productModel.IsDeleted
    };

    this.productService.update(data).subscribe((response: Iresponse) => {
      if (response.Code === '000') {
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: response.Message,
          showConfirmButton: true,
          timer: 2000
        }).then(() => {
          this.getProductsPaginated();
          this.modalService.dismissAll();
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: response.Message,
          showConfirmButton: true,
          timer: 5000
        });
      }
    },
      error => {
        console.log(JSON.stringify(error));
      });
  }


  //delete
  delete(id: number) {

    Swal.fire({
      title: 'Esta seguro que desea eliminar el producto ?',
      text: "Los cambios no podran ser revertidos!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!'
    }).then((result) => {
      if (result.value) {
        //delete service
        this.productService.delete(id).subscribe((response: Iresponse) => {
          if (response.Code === '000') {
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: response.Message,
              showConfirmButton: true,
              timer: 2000
            }).then(() => {
              this.getProductsPaginated();
              this.modalService.dismissAll();
            });
          } else {
            Swal.fire({
              icon: 'warning',
              title: response.Message,
              showConfirmButton: true,
              timer: 3000
            });
          }
        },
          error => {
            console.log(JSON.stringify(error));
          });

      }
    })
  }



  //init create from
  initCreateFrom() {
    this.createForm = this.form.group({
      description: ['', Validators.required],
      externalCode: ['', Validators.required],
      barCode: [''],
      cost: [0, Validators.required],
      price: [0, Validators.required],
      reference: [''],
      existence: [0],
    });
  }


  //init edit from
  initEditFrom() {
    this.editForm = this.form.group({
      description: ['', Validators.required],
      externalCode: ['', Validators.required],
      barCode: [''],
      cost: [0, Validators.required],
      price: [0, Validators.required],
      reference: [''],
      existence: [0],
    });
  }

}
