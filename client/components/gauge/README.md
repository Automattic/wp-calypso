# Gauge

This component renders a simple gauge to show a percentage visually.

## How to use

```js
import Gauge from 'calypso/components/gauge';

function render() {
	return <Gauge percentage={ 40 } metric={ 'Visits' } />;
}
```

## Required Props

- `percentage`: a numeric percentage between 0-100.

## Optional Props

The following props may be used to override defaults.

- `size`: Size (width and height) of element in pixels
- `lineWidth`: Width of arc stroke in pixels
- `labelSize`: Font size of label in pixels
- `colorBg`: Background color
- `colorFg`: Foreground color. The percentage bar displayed over the background.
- `metric`: Text label for the percentage.
