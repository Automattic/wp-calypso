# Order status

## OrderStatus

OrderStatus is a component that displays a badge with human-friendly text describing the payment and shipping status of an order. Payment and shipping statuses are considered separate for UI, so we can also individually show just payment or just shipping status.

Some statuses don't have a shipping status: `cancelled`, `refunded`, and `failed`.

### Usage

```jsx
function render() {
	return (
		<SectionHeader label="Order details">
			<OrderStatus order={ { status: 'pending' } } />
		</SectionHeader>
	);
}
```

### Props

#### `status`

The WooCommerce order status string. See the [WC API docs](https://docs.woocommerce.com/document/managing-orders/) for statuses.

#### `showPayment`

Boolean. Determines whether the payment label should be shown. Defaults to true.

#### `showShipping`

Boolean. Determines whether the shipping label should be shown. Defaults to true.

---

## OrderStatusSelect

OrderStatusSelect is a component that displays a dropdown of order statuses.

### Usage

```jsx
function render() {
	return (
		<SectionHeader label="Order details">
			<OrderStatusSelect value={ this.state.status } onChange={ this.updateStatus } />
		</SectionHeader>
	);
}
```

### Props

#### `value`

The currently selected status. See `woocommerce/lib/order-status/index.js` for a list of available statuses.

#### `onChange`

A function run when a new status is selected.
