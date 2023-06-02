# use-scroll-above-element

`use-scroll-above-element` Checks if a target element has scrolled above the position of a reference element, this is done by attaching a scroll handler to the window object to check for the position of the target element.

## Usage

To use this hook simply import it and assign the references to the target element and the reference element. An example could be an sticky button as we can see below.

```jsx
import useScrollAboveElement from 'calypso/use-scroll-above-element';

const Component = () => {
	const { isAboveElement, targetRef: buttonRef, referenceRef: headerRef } = useScrollAboveElement();

	return (
		<div>
			<div id="header" ref={ headerRef }>
				The header which is the reference element
				<div id="button" style={ { display: isAboveElement ? 'block' : 'none' } }>
					The button or target element
				</div>
			</div>
			<div id="button" style={ { display: isAboveElement ? 'none' : 'block' } } ref={ buttonRef }>
				The button or target element
			</div>
		</div>
	);
};
```
