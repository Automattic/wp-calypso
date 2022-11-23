# AkismetLogo

This component is used to display a [Akismet](https://akismet.com/) logo.

---

## How to use

```js
import AkismetLogo from '@automattic/components';

export default function AkismetLogoExample() {
	return (
		<div>
			<AkismetLogo size={ 64 } />
		</div>
	);
}
```

## Props

- `className` : (string) Custom class name to be added to the SVG element
- `size` : (number) The height of the SVG. Default is `32`
