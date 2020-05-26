export class User {

}

export class UserDetails {
    Id: number;
    UserName: string;
    Surname: string;
    EmailAddress: string;
    Image: string;
    LastLoginTime: string;
    LastLoginTimeEnd: string;
    IsOnline: string;
    Role: Role;
    Person: Person;
}

export class Role{
    Description: string;
    Parent: string;
}

export class Person {
    FirstName: string;
    SecondName: string;
    Surname: string;
    secondSurname: string;
    BirthDate: string;
    FullName: string;
    Gender: string;
    Locators: Array<Locators>;
}

export class Locators {
    Description:string;
    IsMain: boolean;
    Type: string;
}
