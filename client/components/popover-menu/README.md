# `PopoverMenu`

`PopoverMenu` is a component based on `Popover` used to show a menu of actions
in a popover. It is fully keyboard accessible.

## `PopoverMenuItem`

`PopoverMenuItem` is a component used to represent a single item in a
`PopoverMenu`.

### Properties

#### `href { string } - optional`

If set, `PopoverMenuItem` will be rendered as a link; otherwise, it will be
rendered as a button.

#### `isExternalLink { bool } - default: false`

If set to `true`, renders the component using the `ExternalLink` component, which includes an external indicator. Note that `href` **must** be specified to ensure the component remains keyboard accessible.

#### `onClick { func } - optional`

If set, this function will be called when the item is clicked.

#### `className { string } - optional`

Sets a custom className on the button or link.

#### `isSelected { bool } - default: false`

Defines whether or not the `PopoverMenuItem` is the currently selected one.

#### `icon { string } - optional`

If set, a `Gridicon` is rendered, where its `icon` prop is set to this value.

#### `focusOnHover { bool } - default: true`

Defines whether or not the `PopoverMenuItem` should receive the focus when it
is hovered over.

#### `children { node } - optional`

The children to render inside of the `PopoverMenuItem`.

#### `localizeUrl { bool } - default: true`

If set to false, the `href` will not be localized.

### `Popover` Usage

```jsx
let popoverButtonRef;
<>
	<button
		ref={ ( ref ) => ( popoverButtonRef = ref ) }
		className="button"
		onClick={ this.TogglePopover }
	>
		Show Popover
	</button>

	<Popover
		context={ popoverButtonRef }
		isVisible={ this.state.showPopover }
		onClose={ this.closePopover }
		className="component__popover"
		position="top"
	>
		Lorem ipsum dolor sit amet.
	</Popover>
</>;
```

### `PopoverMenu` Usage

```jsx
let popoverButtonRef;
<>
	<button
		ref={ ( ref ) => ( popoverButtonRef = ref ) }
		className="button"
		onClick={ this._onTogglePopoverMenu }
	>
		Show Popover Menu
	</button>

	<PopoverMenu
		context={ popoverButtonRef }
		isVisible={ this.state.showPopoverMenu }
		onClose={ this._closePopoverMenu }
		position={ this.state.popoverPosition }
	>
		<PopoverMenuItem action="A">Item A</PopoverMenuItem>

		<PopoverMenuItem action="B" onClick={ this._onPopoverMenuItemBClick }>
			Item B
		</PopoverMenuItem>

		<PopoverMenuSeparator />

		<PopoverMenuItem action="C">Item C</PopoverMenuItem>
	</PopoverMenu>
</>;
```
