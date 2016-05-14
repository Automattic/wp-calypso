Drop Zone
=========

Drop Zone is a React component which can be used to illustrate areas on the page upon which a user can drop files.

![Example](https://cldup.com/Zl6-s6DIJV-2000x2000.png)

## Usage

Render the component in the context of a parent element which is assigned a `relative` position style, or specify the `fullScreen` to occupy the entire page.

```jsx
import React, { Component } from 'react';
import DropZone from 'components/drop-zone';

class MyComponent extends Component {
	onFilesDrop( files ) {
		console.log( 'You dropped some files: %s', files.map( function( file ) {
			return file.name;
		}.join( ', ' ) );
	}

	render() {
		return (
			<div className="my-component">
				<DropZone onFilesDrop={ this.onFilesDrop } />
			</div>
		);
	}
};

export default MyComponent;
```

## Props

### `onDrop`

A function to be invoked when a drop event occurs within the rendered Drop Zone element. This provides raw access to the drop event.

### `onVerifyValidTransfer`

A function to be invoked when files are dragged over or dropped on the rendered Drop Zone element. Passed a [`DataTransfer` object](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer), this function should return true if the contents of the transfer are valid for the Drop Zone.

### `onFilesDrop`

A function to be invoked when a user drops a file into the rendered Drop Zone element. This does not handle file uploading, nor does it affect any rendered list of items associated with the droppable area.

### `fullScreen`

Pass true to have the droppable area occupy the entire screen, regardless of whether the component is rendered in the context of a `relative` positioned element. Defaults to `false`.
