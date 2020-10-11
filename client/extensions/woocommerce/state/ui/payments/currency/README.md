# Currency

This module is used to manage currency setting related UI.

## Actions

### `changeCurrency( siteId: number, currency: string )`

Adds currency edit to ui state

## Reducer

```js
const object = {
	currency: 'three letter currency key',
};
```

## Selectors

### `getCurrencyWithEdits( state, siteId: number )`

Gets the current payment method with any UI state edits
