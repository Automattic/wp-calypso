# A4APlusWpComLogo (JSX)

This component is used to display the Automattic for Agencies Plus WPCOM logo (a A4A logo, a plus sign, and a WPCOM logo).

---

## How to use

```js
import A4APlusWpComLogo from 'calypso/components/a4a-plus-wpcom-logo';

export default function A4APlusWpComLogoExample() {
	return (
		<div>
			<A4APlusWpComLogo size={ 64 } />
		</div>
	);
}
```

## Props

- `className` : (string) Custom class name to be added to the SVG element
- `size` : (number) The height of the SVG. Default is `32`
