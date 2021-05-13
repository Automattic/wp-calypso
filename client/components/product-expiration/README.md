# Product Expiration

`ProductExpiration` is a React component designed to display a product's expiration or renewal dates in a consistent way to users.

At minimum, it requires an expiry date to display when the product will renew.

## Properties

### `dateFormat { string } - default 'LL'`

This controls the formatting of the date format, which is passed to a localized `moment.format`.

### `expiryDateMoment { moment }`

This is the expiration date as a `moment` instance, and is required for display.

### `renewDateMoment { moment }`

This is the date on which the product will be auto-renewed, as a `moment` instance, used only when provided.

### `isRefundable { boolean } - default false`

Controls whether the product is currently in the refund window, which changes the display to the purchase date, if provided.

### `purchaseDateMoment { moment } - optional`

Optional purchase date, used only when `isRefundable` provided.

## Usage

```jsx
const expiryDateMoment = moment( product.expiry );
const renewDateMoment = moment( product.renewDate );
<ProductExpiration
	expiryDateMoment={ expiryDateMoment }
	renewDateMoment={ renewDateMoment }
	isRefundable={ product.isRefundable }
/>;
```
