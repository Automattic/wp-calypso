Action Card
===========

This is a [`Card` component](../../components/card) that has a call-to-action button.

## Usage

```es6
import ActionCard from 'blocks/action-card';

render() {
	return (
		<ActionCard
			headerText={ 'Header' }
			mainText={ 'Some text' }
			buttonText={ 'Call to action!' }
			buttonIcon="external"
			buttonPrimary={ true }
			buttonHref="https://wordpress.com"
			buttonTarget="_blank"
			buttonOnClick={ noop }
		/>;
	);
}
```

## Props

### `headerText`
  - **Type:** `String`
  - **Required:** `yes`

Header text of the card

### `mainText`
  - **Type:** `String`
  - **Required:** `yes`

Text that describes the header

### `buttonText`
  - **Type:** `String`
  - **Required:** `yes`

Label for the call to action button

### `buttonIcon`
  - **Type:** `String`
  - **Required:** `no`
  - **Default:** `undefined`

GridIcon name to place on the button

### `buttonPrimary`
  - **Type:** `bool`
  - **Required:** `no`
  - **Default:** `undefined`

Whether pass true to the button's primary attribute

### `buttonHref`
  - **Type:** `String`
  - **Required:** `no`
  - **Default:** `undefined`

Href to pass to the button

### `buttonTarget`
  - **Type:** `String`
  - **Required:** `no`
  - **Default:** `undefined`

Button target, to use in conjunction with `buttonHref`

### `buttonOnClick`
  - **Type:** `Function`
  - **Required:** `no`
  - **Default:** `undefined`

Button onClick handler

### `compact`
  - **Type:** `Boolean`
  - **Required:** `no`
  - **Default:** `true`

Determines whether or not this is a compact card

### `illustration`
  - **Type:** `String`
  - **Required:** `no`
  - **Default:** `undefined`

The URL of an illustration to show on the card