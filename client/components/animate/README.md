# Animate

Simple interface to introduce animations to components on initial render. Used as a wrapper.

## How to use

```jsx
import Animate from 'calypso/components/animate';

function render() {
	return <Animate type="appear">Will animate</Animate>;
}
```

## Props

- `type`: (string) a string matching one of the approved transition effects (`appear` or `fade-in`).
