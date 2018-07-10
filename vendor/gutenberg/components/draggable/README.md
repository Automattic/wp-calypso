# Draggable

`Draggable` is a Component that can wrap any element to make it draggable. When used, a cross-browser (including IE) customisable drag image is created. The component clones the specified element on drag-start and uses the clone as a drag image during drag-over. Discards the clone on drag-end.

## Props

The component accepts the following props:

### elementId

The HTML id of the element to clone on drag

- Type: `string`
- Required: Yes

### transferData

Arbitrary data object attached to the drag and drop event.

- Type: `Object`
- Required: Yes

### onDragStart

The function called when dragging starts.

- Type: `Function`
- Required: No
- Default: `noop`

### onDragEnd

The function called when dragging ends.

- Type: `Function`
- Required: No
- Default: `noop`
