# JetpackLogo (JSX)

This component is used to display a Jetpack logo

---

## How to use

```js
import JetpackLogo from 'calypso/components/jetpack-logo';

export default function JetpackLogoExample() {
	return (
		<div>
			<JetpackLogo full size={ 64 } />
		</div>
	);
}
```

## Props

- `className` : (string) Custom class name to be added to the SVG element
- `full` : (bool) Whether or not to show the Jetpack text alongside the icon
- `monochrome` : (bool) Show a monochrome Jetpack logo. Default is `false`
- `size` : (number) The height of the SVG. Default is `32`
