# GraphQL

##  Query

```graphql
query {
  getProducts {
    id
    name
    price
    stock
  }
}
```

## Mutations

Create, update and delete

```graphql
mutation deleteProduct($id: ID) {
  deleteProduct(id: $id)
}
```

## Schema

```graphql
type Client {
  id: ID
  firstName: String
  lastName: String
  company: String
  emails: [Email]
  age: Int
}

type Email {
  email: String
}
```

## Resolvers

```JS
getClients: async () => {
  const clients = await Clients.find({});
  return clients;
}
```

context - it's shared among all resolvers
