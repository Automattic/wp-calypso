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
