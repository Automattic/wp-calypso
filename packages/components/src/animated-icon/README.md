# Animated Icon

`<AnimatedIcon />` is a component that enables the rendering of an Adobe After Effects animation.

The component imports the [Lottie library](https://airbnb.io/lottie/#/), which parses Adobe After Effects animations that have been exported as json with Bodymovin.

## Usage

Pass with an `icon` string to the animation's path:

```jsx
import AnimatedIcon from '@automattic/components';

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

- **Type:** `String` or `Object`
- **Required:** `yes`

The path to the animated icon or the animation's imported json.

### `className`

- **Type:** `String`
- **Required:** `no`

The values of any additional CSS classes to apply to the icon's wrapper element.

### `playUponViewportEntry`

- **Type:** `Boolean`
- **Required:** `no`
- **Default:** `false`

Determines whether the animation will automatically play every time it becomes visible in the browser's viewport. Useful for scenarios where the animation isn't immediately visible upon page load
