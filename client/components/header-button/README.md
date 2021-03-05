# HeaderButton

This component is used to display a large button in the header area, adjacent
to elements like a `Search`. It takes an `icon` prop that is an ID of a
`Gridicon`, and a `label` prop that is used as the label of the button. All
the other properties are passed to the `Button` component that is used to
implement this one.

## How to use

```js
import HeaderButton from 'calypso/components/header-button';

function MyHeader() {
	return (
		<div>
			<HeaderButton icon="plus-small" label="Add Plugin" href="/plugins/manage" />
		</div>
	);
}
```

## Props

- `icon` : (string) ID of a `Gridicon` icon
- `label` : The text label of the button

All other props are passed to the underlying `Button`.
