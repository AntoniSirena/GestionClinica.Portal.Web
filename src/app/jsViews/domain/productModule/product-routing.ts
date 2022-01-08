
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from "@angular/router";
import { ProductComponent } from './product/product.component';



const routes: Routes = [
    {
        path: 'product',
        component: ProductComponent,
        data: {
            title: 'Productos'
        },
    },
]


@NgModule({
    imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})

export class ProductRoutingModule {

}
