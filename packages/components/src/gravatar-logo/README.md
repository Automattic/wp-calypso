# GravatarLogo

This component is used to display a [Gravatar](https://gravatar.com/) logo.

---

## How to use

```js
import GravatarLogo from '@automattic/components';

export default function GravatarLogoExample() {
	return (
		<div>
			<GravatarLogo size={ 64 } />
		</div>
	);
}
```

## Props

- `className` : (string) Custom class name to be added to the SVG element
- `size` : (number) The height of the SVG. Default is `32`
