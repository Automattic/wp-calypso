Popover
=======

`Popover` is a react component that can be used to show any content in a popover.

### Properties

#### `autoPosition { bool } - default: true`

Defines if the Popover should be automatically positioned under specific circumstances. For instance when the window is scrolled, the viewport is resized, etc.

#### `autoRtl { bool } - default: true`

Defines if the Popover should automatically be adjusted for right-to-left contexts.
`autoRtl={ true }` will swap `right` and `left` position props in RTL context.

#### `className { string } - optional`

Set a custom className for the main container. Keep in mind that `popover` className will be always added to the instance.

#### `closeOnEsc { bool } - default: true`

#### `context { DOMElement | ref }`

The `context` property must be set to a DOMElement or React ref to the element the popover
should be attached to (point to).

#### `id { string } - optional`

Use this optional property to set a Popover identifier among all of the Popover instances.
This property has been thought for development purpose.

#### `ignoreContext`

The `ignoreContext` lets you specify a component that you want to be on the inside clickOutside context. 
So a context that you want to ignore. In most cases this is not needed but if you want to also have a label 
that can trigger the opening and closing of the Popover then you need to pass in the label component as a reference.

#### `isVisible { bool } default - false`

By controlling the popover's visibility through the `isVisible` property, the
popover itself is responsible for providing any CSS transitions to
animate the opening/closing of the popover. This also keeps the parent's code
clean and readable, with a minimal amount of boilerplate code required to show
a popover.

#### `position { string } - default: 'top'`

The `position` property can be one of the following values:

- `top`
- `top left`
- `top right`
- `bottom`
- `bottom left`
- `bottom right`
- `left`
- `right`

#### `rootClassName { string } - optional`

The `<Popover />` component is mounted into a `<ReactChild />` component at the root of the `<body>`.
use this property if you want to add a cuestom css class to this root element.

#### `showDelay { number } - default: 0 (false)`

Adds a delay before to show the popover. Its value is defined in `milliseconds`.

#### `onClose { func }`

The popover's `onClose` property must be set, and should modify the parent's
state such that the popover's `isVisible` property will be false when `render`
is called.

#### `onShow { func } - optional`

This function will be executed when the popover is shown.


PopoverMenu
===========

`PopoverMenu` is a component based on `Popover` used to show a menu of actions in a popover.
It is fully keyboard accessible.


PopoverMenuItem
===============

`PopoverMenuItem` is a component used to represent a single item in a `PopoverMenu`.

### Properties

#### `href { string } - optional`

If set, `PopoverMenuItem` will be rendered as a link; otherwise, it will be rendered as a button.

#### `className { string } - optional`

Sets a custom className on the button or link.

#### `isSelected { bool } - default: false`

Defines whether or not the `PopoverMenuItem` is the currently selected one.

#### `icon { string } - optional`

If set, a `Gridicon` is rendered, where its `icon` prop is set to this value.

#### `focusOnHover { bool } - default: true`

Defines whether or not the `PopoverMenuItem` should receive the focus when it is hovered over.

#### `children { node } - optional`

The children to render inside of the `PopoverMenuItem`.


### `Popover` Usage

```jsx
<button
	ref="popoverButton" className="button"
	onClick={ this.TogglePopover }
>
	Show Popover
</button>

<Popover
	context={ this.refs && this.refs.popoverButton }
	isVisible={ this.state.showPopover }
	onClose={ this.closePopover }
	className='component__popover'
	position="top"
>
	Lorem ipsum dolor sit amet.
</Popover>
```

### `PopoverMenu` Usage

```jsx
<button
	ref="popoverMenuButton" className="button"
	onClick={ this._onTogglePopoverMenu }
>
	Show Popover Menu
</button>

<PopoverMenu
	context={ this.refs && this.refs.popoverMenuButton }
 	isVisible={ this.state.showPopoverMenu }
	onClose={ this._closePopoverMenu }
	position={ this.state.popoverPosition }
>
	<PopoverMenuItem action="A">Item A</PopoverMenuItem>

	<PopoverMenuItem
		action="B"
		onClick={ this._onPopoverMenuItemBClick }
	>
		Item B
	</PopoverMenuItem>

	<PopoverMenuSeparator />

	<PopoverMenuItem action="C">Item C</PopoverMenuItem>
</PopoverMenu>
```
