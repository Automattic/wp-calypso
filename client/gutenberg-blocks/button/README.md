# Button

This component is used to implement dang sweet buttons.

## Usage

At a minimum, you must indicate the type of button with one of the `isPrimary`, `isDefault` or 
`isLink` properties.

```jsx
import { Button } from '@wordpress/components';

export default function MyComponent() {
	return (
		<Button isPrimary>Primary button</Button>
	);
}
```

## Props

The following props are used to control the display of the component. Any additional props will 
be passed to the rendered `<a />` or `<button />` element. The presence of a `href` prop 
determines whether an anchor element is rendered instead of a button.

- `isPrimary`: (bool) whether the button is styled as a primary button.
- `isDefault`: (bool) whether the button is styled as a default button.
- `isLarge`: (bool) whether the button is styled as a large button.
- `isSmall`: (bool) whether the button is styled as a small button.
- `isBusy`: (bool) whether the button is styled as a busy button.
- `isLink`: (bool) whether the button is styled as a link.
- `href`: (string) URL of the page the link goes to. If this property is added, it will use an `a`
 rather than a `button` element.
- `isDestructive`: (bool) whether the button is styled to indicate a destructive behavior (only 
if `isLink` is `true`).
 
