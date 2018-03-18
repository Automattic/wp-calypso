## Focusable

This component lets you wrap complex content in an accessible, clickable wrapper. `Focusable` should be used in place of putting an `onClick` event on a div. It adds [the "button" ARIA role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_button_role), for screen reader support, and enables keyboard support for keyboard-only accessibility.

**Think about your markup before using this component!** You probably don't need it, for example:

- If you want to add an action to simple text, use a `Button`
- If the action saves page data, use `Button` with `type=submit`
- If the action is a navigation change, use a link (or `Button` with `href`)
- If you want a larger click target for your input, use a `label`

If you want to add an action to a larger element, for example the Language Picker, you can use this component. Be aware that a screen reader will read the entire contents of `Focusable` to the user, so _try_ to keep the contents short and actionable.

#### How to use:

```jsx
import Focusable from 'components/focusable';

export default function InteractiveItem() {
	return (
		<Focusable onClick={ func }>
			// Some complex display, may contain divs, images, other components, etc.
		</Focusable>
	);
}
```

#### Props

* `onClick`: (func) Function called when the button is clicked, or when focused and enter or space are pressed. Required.
* `onKeyDown`: (func) Function called when focused and any other keyboard event happens (useful for arrow navigation)
