# Animated Icon

`<AnimatedIcon />` is a component that enables the rendering of an Adobe After Effects animation.

The component imports the [Lottie library](https://airbnb.io/lottie/#/), which parses Adobe After Effects animations that have been exported as json with Bodymovin.

## Usage

Pass with an `icon` string to the animation's path:

```jsx
import AnimatedIcon from 'calypso/components/animated-icon';

function render() {
	return (
		<AnimatedIcon
			icon="/calypso/animations/app-promo/wp-to-jp.json"
			className="example-component__icon"
		/>
	);
}
```

## Props

### `icon`

- **Type:** `String`
- **Required:** `yes`

The path to the animated icon.

### `className`

- **Type:** `String`
- **Required:** `no`

The values of any additional CSS classes to apply to the icon's wrapper element.
