# getKeyboardHandler

## `getKeyboardHandler( callback: function )`

This is an accessibility helper function for lists of items which have onClick events. It is an event handler, meant to be called on `onKeyDown`. It triggers the passed callback only if the key pressed is space or enter, to mirror [button functionality](https://www.w3.org/TR/wai-aria-practices/#button). It will also focus the next/previous sibling (if one exists) if the down/up arrows are pressed.

This is meant to be used on a list of elements (`<tr>`, `<li>`, …), so that they can be made keyboard-accessible. Example:

```jsx
/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
import getKeyboardHandler from 'woocommerce/lib/get-keyboard-handler';

export default function ExampleNavList() {
	return (
		<ul>
			<li
				role="button"
				tabIndex="0"
				onClick={ onClick }
				onKeyDown={ getKeyboardHandler( onClick ) }
			>
				{ complexChild }
			</li>
			<li
				role="button"
				tabIndex="0"
				onClick={ onClick }
				onKeyDown={ getKeyboardHandler( onClick ) }
			>
				{ complexChild }
			</li>
			<li
				role="button"
				tabIndex="0"
				onClick={ onClick }
				onKeyDown={ getKeyboardHandler( onClick ) }
			>
				{ complexChild }
			</li>
		</ul>
	);
}
```

The `tabIndex` is what makes the `li`s focusable, so make sure you have that, and that you also add focus styles along with your hover styles.

This is used in the [`<TableRow>` component](https://github.com/Automattic/wp-calypso/blob/HEAD/client/extensions/woocommerce/components/table/README.md) to make the table rows keyboard accessible.
