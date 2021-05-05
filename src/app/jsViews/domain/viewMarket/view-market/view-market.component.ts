import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { SizeImageArticle } from '../../../../configurations/jsConfig';
import { environment } from '../../../../environments/environment';
import { Article, ImgDetail } from '../../../../models/domain/market/market';
import { MarketService } from '../../../../services/domain/market/market.service';
import { Router } from '@angular/router';
import { User } from '../../../../models/profile/profile';
import { BaseService } from '../../../../services/base/base.service';
import { Category, SubCategory } from '../../../../models/domain/market/market';
import { SizeImageDetailArticle } from './../../../../configurations/jsConfig';


@Component({
  selector: 'app-view-market',
  templateUrl: './view-market.component.html',
  styleUrls: ['./view-market.component.css'],
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .dark-modal .modal-content {
      background-color: #292b2c;
      color: white;
    }
    .dark-modal .close {
      color: white;
    }
    .light-blue-backdrop {
      background-color: #5cb3fd;
    }
  `]
})
export class ViewMarketComponent implements OnInit {

  @ViewChild('toPostModal') toPostModal: ElementRef;
  @ViewChild('imgDetailModal') imgDetailModal: ElementRef;

  _currentPage: number = 1;

  filterSellForm: FormGroup;
  filterRentForm: FormGroup;

  articles = new Array<Article>();
  itemQuantity: number;
  imgDetails = new Array<ImgDetail>();

  coreURL = environment.coreURL;
  img_Width = SizeImageArticle.width;
  img_height = SizeImageArticle.height;

  imgDetail_Width = SizeImageDetailArticle.width;
  imgDetail_height = SizeImageDetailArticle.height;

  userData = new User();

  timerInputStr: any = 0;

  inputStr: string;
  recordResultMessage: string;
  
  categories = new Array<Category>();
  subCategories = new Array<SubCategory>();

  categoryId: number = 0;
  subCategoryId: number = 0;

  currentPage: number;
  currentPageAdvancedSearch: number;
  currentPageSearchStr: number;

  constructor(
    private form: FormBuilder,
    private marketService: MarketService,
    private modalService: NgbModal,
    private routerService: Router,
    private baseService: BaseService) {

  }

  ngOnInit(): void {
    this.currentPage = 1;
    this.currentPageAdvancedSearch = 1;
    this.currentPageSearchStr = 1;

    this.initFilterSellFrom();
    this.initFilterRentFrom();
    this.getArticles('Sell', 0, 0, this.currentPage);
    this.userData = this.baseService.getUserData();
    this.getCategories();
  }

  getArticles(marketType: string, categoryId: number, subCategoryId: number, page: number) {
    this.inputStr = '';
    this.marketService.getArticles(marketType, categoryId, subCategoryId, page).subscribe((response: Array<Article>) => {
      this.articles = response;
      this.itemQuantity = this.articles.length;

      if(this.articles.length <= 1){
        this.recordResultMessage ='registro encontrado'
      }

      if(this.articles.length > 1){
        this.recordResultMessage ='registros encontrados'
      }

    },
      error => {
        console.log(JSON.stringify(error));
      });
  }

  getArticlesByInputStr(marketType: string, inputStr: string, page: number) {
    this.marketService.getArticlesByInputStr(marketType, inputStr, page).subscribe((response: Array<Article>) => {
      this.articles = response;
      this.itemQuantity = this.articles.length;

      if(this.articles.length <= 1){
        this.recordResultMessage ='registro encontrado'
      }

      if(this.articles.length > 1){
        this.recordResultMessage ='registros encontrados'
      }

    },
      error => {
        console.log(JSON.stringify(error));
      });
  }

  getArticlesByInputStrByTime(marketType: string, inputStr: string) {
    clearTimeout(this.timerInputStr);
    this.timerInputStr = setTimeout(() => {
      this.currentPageSearchStr = 1;
      this.getArticlesByInputStr(marketType, inputStr, this.currentPageSearchStr);
    }, 1000);
  }

  viewMoreArticles(marketType: string){

    if(this.categoryId || this.subCategoryId){
      this.currentPageAdvancedSearch = this.currentPageAdvancedSearch + 1;
      this.getArticles(marketType, this.categoryId, this.subCategoryId, this.currentPageAdvancedSearch);
    }else if(this.inputStr){
      this.currentPageSearchStr = this.currentPageSearchStr + 1;
      this.getArticlesByInputStr(marketType, this.inputStr, this.currentPageSearchStr);
    }
    else{
      this.currentPage = this.currentPage + 1;
      this.getArticles(marketType, 0, 0, this.currentPage);
    }

  }


  getImgDetailByArticleId(articleId: number) {
    this.marketService.getImgDetailByArticleId(articleId).subscribe((response: Array<ImgDetail>) => {
      this.imgDetails = response;

      if (this.imgDetails.length > 0) {
        this.modalService.open(this.imgDetailModal, { size: 'sm-lg', scrollable: true, backdrop: 'static' });
      }

      if (this.imgDetails.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: "Este artículo no tiene detalles de imagen",
          showConfirmButton: true,
          timer: 10000
        });
      }

    },
      error => {
        console.log(JSON.stringify(error));
      });
  }

  filterArticles(marketType, form) {
    let categoryId = 0;
    let subCategoryId = 0;

    if (form.categoryId > 0) {
      categoryId = form.categoryId
    }
    if (form.subCategoryId > 0) {
      subCategoryId = form.subCategoryId
    }

    this.categoryId = categoryId;
    this.subCategoryId = subCategoryId;

    this.currentPageAdvancedSearch = 1;

    this.getArticles(marketType, categoryId, subCategoryId, this.currentPageAdvancedSearch);
  }

  getSubCategories_ByCategoryId(id: number) {
    this.marketService.getSubCategories(id).subscribe((response: Array<SubCategory>) => {
      this.subCategories = response;
    },
      error => {
        console.log(JSON.stringify(error));
      });
  }


  getCategories() {
    this.marketService.getCategories().subscribe((response: Array<Category>) => {
      this.categories = response;
    },
      error => {
        console.log(JSON.stringify(error));
      });
  }

  toPost() {
    if (this.userData.IsVisitorUser) {
      this.modalService.open(this.toPostModal, { size: 'sm-lg', scrollable: true, backdrop: 'static' });
    } else {
      this.routerService.navigate(['market']);
    }
  }

  goToLoginPage() {
    this.modalService.dismissAll();
    this.routerService.navigate(['login']);
  }

  goToRegisterPage() {
    this.modalService.dismissAll();
    this.routerService.navigate(['register']);
  }


  //init filter sell from
  initFilterSellFrom() {
    this.filterSellForm = this.form.group({
      categoryId: [''],
      subCategoryId: [''],
    });
  }


  //init filter rent from
  initFilterRentFrom() {
    this.filterRentForm = this.form.group({
      categoryId: [''],
      subCategoryId: [''],
    });
  }

}
