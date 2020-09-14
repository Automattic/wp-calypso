# Query Simple Payments

`<QuerySimplePayments />` is a React component used in managing network requests for Simple Payments for a given site.
If passed a product ID, it will request the product for the specified site ID when the component is mounted. If no
product ID is passed, it will request all products for the specified site ID.

## Usage

Render the component, optionally passing a product ID. The component does not accept any children, nor does it
render any of its own.

```jsx
function AllProducts() {
	return <QuerySimplePayments siteId={ 12345 } />;
}

function SingleProduct() {
	return <QuerySimplePayments siteId={ 12345 } productId={ 141 } />
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

A prop specifying which site to requests the products from.

### `productId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

An optional prop specifying a single product to be requested. If set, the product for the specified site ID will
be requested.
