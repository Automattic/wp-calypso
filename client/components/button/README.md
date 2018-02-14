Button
=========

This component is used to implement dang sweet buttons.

#### How to use:

```jsx
import Button from 'components/button';

export default function RockOnButton() {
	return (
		<Button compact primary>
			You rock!
		</Button>
	);
}
```

#### Props

The following props are used to control the display of the component. Any additional props will be passed to the rendered `<a />` or `<button />` element. The presence of a `href` prop determines whether an anchor element is rendered instead of a button.

* `compact`: (bool) whether the button is compact or not.
* `primary`: (bool) whether the button is styled as a primary button.
* `scary`: (bool) whether the button has modified styling to warn users (delete, remove, etc).
* `href`: (string) if this property is added, it will use an `a` rather than a `button` element.
* `borderless`: (bool) whether button should be displayed without borders


## BlockButton

This is a block-level button wrapper, using ARIA + keyboard handlers to create an element that can wrap other components. Buttons should only [contain phrasing content](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button), but there are places we have `div` wrappers with `onClick`. This is not accessible from the keyboard. This component should replace those divs, and adds button-like keyboard accessibility.

**Think about your markup before using this component!** You probably don't need it. If you can use a plain `Button`, use that to best support assistive tech. You also don't need to wrap a toggle or input with a click event if you use a `<label>`, that will connect the label text to the input.

#### How to use:

```jsx
import BlockButton from 'components/button/block';

export default function InteractiveItem() {
	return (
		<BlockButton onClick={ func }>
			// Some complex display, may contain divs, images, other components, etc.
		</BlockButton>
	);
}
```

#### Props

* `onClick`: (func) Function called when the button is clicked, or when focused and enter or space are pressed. Required.
* `onKeyDown`: (func) Function called when focused and any other keyboard event happens (useful for arrow navigation)
