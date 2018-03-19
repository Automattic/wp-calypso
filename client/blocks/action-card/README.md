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

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>Yes</td></tr>
</table>

Header text of the card

### `mainText`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>Yes</td></tr>
</table>

Text that describes the header

### `buttonText`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>Yes</td></tr>
</table>

Label for the call to action button

### `buttonIcon`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>undefined</code></td></tr>	
</table>

GridIcon name to place on the button

### `buttonPrimary`

<table>
	<tr><td>Type</td><td>bool</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>undefined</code></td></tr>
</table>

Whether pass true to the button's primary attribute

### `buttonHref`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>undefined</code></td></tr>
</table>

Href to pass to the button

### `buttonTarget`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>undefined</code></td></tr>
</table>

Button target, to use in conjunction with `buttonHref`

### `buttonOnClick`

<table>
	<tr><td>Type</td><td>Function</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>undefined</code></td></tr>
</table>

Button onClick handler
