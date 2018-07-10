Keyboard Shortcuts
==================

`<KeyboardShortcuts />` is a component which handles keyboard sequences during the lifetime of the rendering element.

When passed children, it will capture key events which occur on or within the children. If no children are passed, events are captured on the document.

It uses the [Mousetrap](https://craig.is/killing/mice) library to implement keyboard sequence bindings.

## Example

Render `<KeyboardShortcuts />` with a `shortcuts` prop object:

```jsx
class SelectAllDetection extends Component {
	constructor() {
		super( ...arguments );

		this.setAllSelected = this.setAllSelected.bind( this );

		this.state = { isAllSelected: false };
	}

	setAllSelected() {
		this.setState( { isAllSelected: true } );
	}

	render() {
		return (
			<div>
				<KeyboardShortcuts shortcuts={ {
					'mod+a': this.setAllSelected,
				} } />
				Combination pressed? { isAllSelected ? 'Yes' : 'No' }
			</div>
		);
	}
}
```

## Props

The component accepts the following props:

### children

Elements to render, upon whom key events are to be monitored.

- Type: `Element` | `Element[]`
- Required: No

### shortcuts

An object of shortcut bindings, where each key is a keyboard combination, the value of which is the callback to be invoked when the key combination is pressed.

- Type: `Object`
- Required: No

__Note:__ The value of each shortcut should be a consistent function reference, not an anonymous function. Otherwise, the callback will not be correctly unbound when the component unmounts.

__Note:__ The `KeyboardShortcuts` component will not update to reflect a changed `shortcuts` prop. If you need to change shortcuts, mount a separate `KeyboardShortcuts` element, which can be achieved by assigning a unique `key` prop.

## bindGlobal

By default, a callback will not be invoked if the key combination occurs in an editable field. Pass `bindGlobal` as `true` if the key events should be observed globally, including within editable fields.

- Type: `Boolean`
- Required: No

_Tip:_ If you need some but not all keyboard events to be observed globally, simply render two distinct `KeyboardShortcuts` elements, one with and one without the `bindGlobal` prop.

## event

By default, a callback is invoked in response to the `keydown` event. To override this, pass `event` with the name of a specific keyboard event.

- Type: `String`
- Required: No

## References

- [Mousetrap documentation](https://craig.is/killing/mice)
