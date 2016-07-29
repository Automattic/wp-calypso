Popover
=======

React components that provide support for modal popovers.

- `Popover` is a component that can be used to show any content
in a popover.
- `PopoverMenu` is a component based on `Popover` used to show a menu of
actions in a popover. It is fully keyboard accessible.

### Common `Popover`/`PopoverMenu` Properties

#### `onClose`

The popover's `onClose` property must be set, and should modify the parent's
state such that the popover's `isVisible` property will be false when `render`
is called.

#### `isVisible`

By controlling the popover's visibility through the `isVisible` property, the
popover itself is responsible for providing any CSS transitions to
animate the opening/closing of the popover. This also keeps the parent's code
clean and readable, with a minimal amount of boilerplate code required to show
a popover.

#### `context`

The `context` property must be set to a React ref to the element the popover
should be attached to (point to).

#### `position`

The `position` property can be one of the following values:

- `top`
- `top left`
- `top right`
- `bottom`
- `bottom left`
- `bottom right`
- `left`
- `right`

#### `ignoreContext`

The `ignoreContext` lets you specify a component that you want to be on the inside clickOutside context. 
So a context that you want to ignore. In most cases this is not needed but if you want to also have a label 
that can trigger the opening and closing of the Popover then you need to pass in the label component as a reference.

### `Popover` Usage

```js
<button ref="popoverButton" className="button"
		onClick={ this._onTogglePopover }>Show Popover</button>
<Popover context={ this.refs && this.refs.popoverButton }
		isVisible={ this.state.showPopover }
		onClose={ this._closePopover }
		className='component__popover'
		position="top">
	Lorem ipsum dolor sit amet.
</Popover>
```

### `PopoverMenu` Usage

```js
<button ref="popoverMenuButton" className="button"
		onClick={ this._onTogglePopoverMenu }>Show Popover Menu</button>
<PopoverMenu context={ this.refs && this.refs.popoverMenuButton }
	 	isVisible={ this.state.showPopoverMenu }
		onClose={ this._closePopoverMenu }
		position={ this.state.popoverPosition }>
	<PopoverMenuItem action="A">Item A</PopoverMenuItem>
	<PopoverMenuItem action="B"
			onClick={ this._onPopoverMenuItemBClick }>Item B</PopoverMenuItem>
	<PopoverMenuSeparator />
	<PopoverMenuItem action="C">Item C</PopoverMenuItem>
</PopoverMenu>
```
