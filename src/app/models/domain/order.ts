

export class CreateOrderDTO {
    ArticleId: number;
    Quantity: number;
}


export class OrderDetailDTO {

    Id: number;
    Date: string;
    Status: string;
    StatusShortName: string;
    Subtotal: number;
    Discount: number;
    ITBIS: number;
    TotalAmount: number;
    Items: Array<OrderDetailItemDTO>
    Client: string;
    ClientPhoneNumber: string;
    Comment: string;
    Address: string;
    PaymentMethod: string;
    ClientId: number;
}

export class OrderDetailItemDTO {
    Id: number;
    ArticleId: number;
    Title: string;
    Quantity: number;
    Price: number;
    CurrencyCode: string;
    Subtotal: number;
    ITBIS: number;
    TotalAmount: number;
    UseStock: boolean;
    Stock: number;
    MinQuantity: number;
    MaxQuantity: number;
    Comment: string;
    ClientId: number;
}


export class OrderInboxDTO {
    Id: number;
    TotalAmount: number;
    Date: string;
    Status: string;
    Address: string;
    PaymentMethod: string;
}

export class OrderStatusDTO {
    Id: number;
    ShortName: string;
    Description: string;
}