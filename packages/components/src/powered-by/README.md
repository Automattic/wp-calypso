# PoweredBy (JSX)

A React component for displaying "Powered by" branding with a logo for Jetpack, WooCommerce, or WordPress.com.

---

## How to use

```js
import { PoweredBy } from '@automattic/components';

export default function Example() {
	return (
		<div>
			<PoweredBy brand="jetpack" />
			<PoweredBy brand="woocommerce" colorVariant="black" />
			<PoweredBy brand="wpcom" colorVariant="white" />
		</div>
	);
}
```

## Props

- `brand` : (string, required) One of `'jetpack'`, `'woocommerce'`, `'wpcom'`
- `colorVariant` : (string) One of `'color'`, `'black'`, `'white'`. Default is `'color'`
- `height`: (number) The height of the brand logo. The width is calculated automatically as needed. Default is `25`
- `className` : (string) Additional CSS class names
