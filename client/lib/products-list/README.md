# Products List

`products-list` is a collection of all the products users can have on WordPress.com, as returned from the `/products` REST API endpoint. It can be required into a file like:

```js
import productsListFactory from 'calypso/lib/products-list';
const productsList = productsListFactory();
```

Currently `productsList` just has two public methods, `get()`, and `fetch()`:

`get()`

The get request will first check for data on the object itself, and if it finds data, will return that. Otherwise it will check `localStorage` through `store` for a `ProductsList` object, and will return that data or an empty array if null and immediately call the fetch method.

`fetch()`

The fetch method will call out to the `/products` endpoint, store the results to the `ProductsList` object, emit a `change` event, and store the new data to `localStorage`.
