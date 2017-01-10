Animate
=======

Simple interface to introduce animations to components on initial render. Used as a wrapper.

#### How to use:

```jsx
import Animate from 'components/animate';

render() {
	return (
		<Animate type="appear">
			Will animate
		</Animate>
	);
}
```

#### Props

* `type`: a string matching one of the approved transition effects.
