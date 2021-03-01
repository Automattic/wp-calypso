# Action Card

This is a [`Card` component](../../components/card) that has a call-to-action button.

## Usage

```jsx
import ActionCard from 'calypso/components/action-card';

function render() {
	return (
		<ActionCard
			headerText={ 'Header' }
			mainText={ 'Some text' }
			className={ classnames( 'my-classname-1', 'my-classname-2' ) }
			buttonText={ 'Call to action!' }
			buttonIcon="external"
			buttonPrimary={ true }
			buttonHref="https://wordpress.com"
			buttonTarget="_blank"
			buttonOnClick={ noop }
			buttonDisabled={ false }
		/>
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

### `classNames`

- **Type:** `Object`
- **Required:** `no`
- **Default:** `{}`

Class names to append to the Card

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

### `buttonDisabled`

- **Type:** `Boolean`
- **Required:** `no`
- **Default:** `false`

Make the button disabled.

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
