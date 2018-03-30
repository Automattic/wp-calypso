Action Card
===========

This is a [`Card` component](../../components/card) that has a call-to-action button.

## Usage

```es6
import { noop } from 'lodash';
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

### `children`

  - **Type:** `React node`
  - **Required:** `no`
  - **Default:** `undefined`

If a child is passed, it will be used in place of the button (hence rendering button props useless).

### `headerText`

  - **Type:** `String`
  - **Required:** `yes`

Header text of the card.

### `mainText`

  - **Type:** `String`
  - **Required:** `yes`

Text appearing below the header.

### `buttonText`

  - **Type:** `String`
  - **Required:** `yes`

Label of the button.

### `buttonIcon`

  - **Type:** `String`
  - **Required:** `no`
  - **Default:** `undefined`

Name of the GridIcon icon to place on the button.

### `buttonPrimary`

  - **Type:** `bool`
  - **Required:** `no`
  - **Default:** `undefined`

Flag indicating if the button is primary or not.

### `buttonHref`

  - **Type:** `String`
  - **Required:** `no`
  - **Default:** `undefined`

Button `href` attribute.

### `buttonTarget`

  - **Type:** `String`
  - **Required:** `no`
  - **Default:** `undefined`

Button `target` attribute, to use in conjunction with the `buttonHref` prop.

### `buttonOnClick`

  - **Type:** `Function`
  - **Required:** `no`
  - **Default:** `undefined`

Button click event handler.
