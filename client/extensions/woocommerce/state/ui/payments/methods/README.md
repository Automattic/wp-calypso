# Payment Methods

This module is used to manage payment method related UI.

## Actions

### `openPaymentMethodForEdit( siteId: number, id: string )`

Shows a payment methods edit pane

### `closeEditingPaymentMethod( siteId: number )`

Closes a payment methods edit pane

### `cancelEditingPaymentMethod( siteId: number )`

Clears changes and closes a payment methods edit pane

### `changePaymentMethodField( siteId: number, field: string, value: string )`

Adds an edit to currently editing changes

## Reducer

This is saved on a per-site basis, either as "LOADING" (when requesting settings), or a list of settings as returned from the site's API.

```js
const object = {
	creates: [ { id: { index: 0 }, settings: { field: 'Value' /*...*/ } } ],
	updates: [ { id: 'MethodId', settings: { field: 'Value' /*...*/ } } ],
	deletes: [ { id: 1 } /*...*/ ],
	currentlyEditingId: 'MethodId',
	currentlyEditingChanges: { fieldName: 'Value' /*...*/ },
};
```

## Selectors

### `getPaymentMethodEdits( state, siteId: number )`

Gets all edits for the currently editing payment method.

### `getPaymentMethodsWithEdits( state, siteId: number )`

Gets payment methods with with creates, deletes, and updates.

### `getPaymentMethodsGroup( state, type: string, siteId: number )`

Gets payment methods of a specific type.

### `getCurrentlyEditingPaymentMethod( state, siteId: number )`

Gets the payment method that is currently being edited with edits.

### `isCurrentlyEditingPaymentMethod( state, siteId: number )`

Returns whether or not a payment method is being edited
