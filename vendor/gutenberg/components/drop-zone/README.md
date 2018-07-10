# DropZone

`DropZone` is a Component creating a drop zone area taking the full size of its parent element. It supports dropping files, HTML content or any other HTML drop event. To work properly this components needs to be wrapped in a `DropZoneProvider`.

## Usage

```jsx
import { DropZoneProvider, DropZone } from '@wordpress/components';

function MyComponent() {
	return (
		<DropZoneProvider>
			<div>
				<DropZone onDrop={ () => console.log( 'do something' ) } />
			</div>
		</DropZoneProvider>
	);
}
```

## Props

The component accepts the following props:

### onFilesDrop

The function is called when dropping a file into the `DropZone`. It receives two arguments: an array of dropped files and a position object which the following shape: `{ x: 'left|right', y: 'top|bottom' }`. The position object indicates whether the drop event happened closer to the top or bottom edges and left or right ones.

- Type: `Function`
- Required: No
- Default: `noop`

### onHTMLDrop

The function is called when dropping a file into the `DropZone`. It receives two arguments: the HTML being dropped and a position object.

- Type: `Function`
- Required: No
- Default: `noop`

### onDrop

The function is generic drop handler called if the `onFilesDrop` or `onHTMLDrop` are not called. It receives two arguments: The drop `event` object and the position object.

- Type: `Function`
- Required: No
- Default: `noop`
