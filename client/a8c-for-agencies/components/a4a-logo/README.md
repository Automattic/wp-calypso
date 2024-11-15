# A4ALogo (JSX)

This component is used to display an Automattic or Automattic for Agencies logo

---

## How to use

```js
import A4ALogo from 'calypso/components/a4a-logo';

export default function A4ALogoExample() {
	return (
		<div>
			<A4ALogo full size={ 64 } />
		</div>
	);
}
```

## Props

- `full` : (bool) Whether or not to show the full Automattic logo with text
- `fullA4A` : (bool) Whether or not to show the full "Automattic for Agencies" logo
- `className` : (string) Custom class name to be added to the SVG element
- `size` : (number) The height of the SVG. Default is `32`
