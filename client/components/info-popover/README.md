InfoPopover
===========

`InfoPopover` is a component based on `Popover` used to show a popover as a tooltip to a `Gridicon`.

### `InfoPopover` Properties

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

#### `toggle`

The `toggle` property is a function that can be set to control the visibility of the InfoPopover from the parent component.

### `isVisible`

The `isVisible` property should be a boolean and needs to be set if you are also using the `toggle` property.

### `InfoPopover` Usage

```js
<InfoPopover position="bottom left">
    This is some informational text
</InfoPopover>
```
