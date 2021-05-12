# Image Selector

Image Selector is a component that uses the Media Modal to select images and preview previously selected images. It allows multiple images to be passed or it can be limited to a single item.

## Usage

Pass an array of image IDs that will be shown in the preview and preselected in the Media Modal.

Changes to the selection of images will be passed back in various props for setting images, dropping images, and removing images. See the example.jsx file for a more complete example.

```jsx
import ImageSelector from 'calypso/blocks/image-selector';

export default function MyFeaturedImages() {
	return <ImageSelector imageIds={ [ 34, 105 ] } multiple />;
}
```

This component needs both its own styles imported as well as the Media Modal styles on the page in which it's displayed.

```scss
@import 'assets/stylesheets/sections/media';
@import 'blocks/image-selector/style';
```

### Props

Props are displayed as a table with Name, Type, Default, and Description as headings.

**Required props are marked with `*`.**

| Name                | Type     | Default | Description                                                                                                        |
| ------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| `className`         | `string` | ``      | String used for the class of outer ImageSelector wrapper                                                           |
| `compact`           | `bool`   | `0`     | Determines whether or not the upload picker is compact or full size                                                |
| `imageIds`\*        | `array`  | `[]`    | An array of image IDs to be shown in the preview and selected in the Media Modal                                   |
| `maxWidth`          | `number` | `450`   | Maximum width to be used for a preview image                                                                       |
| `onAddImage`        | `func`   | `noop`  | Passes a single transient image object after an image is dropped on the DropZone                                   |
| `onImageChange`\*   | `func`   | `noop`  | Passes the entire array of currently selected image objects when transitioning from a transient to permanent image |
| `onImageSelected`\* | `func`   | `noop`  | Passes an array of selected image objects when set from the Media Modal                                            |
| `onRemoveImage`\*   | `func`   | `noop`  | Passes a single image object after clicking the remove button on an image                                          |
| `previewClassName`  | `string` | ``      | String used for the class of the preview images wrapper                                                            |
| `selecting`         | `bool`   | `false` | Whether or not the Media Modal is currently open for selecting images                                              |
| `showEditIcon`      | `bool`   | `false` | Determines whether or not the edit icon is displayed in the bottom right corner of the image in the preview area   |

### Persistence and Tracking

The Image Selector component intentionally does not persist any information. Handling image state, saving, and tracking should be done when image changes are passed back:

```jsx
setImage = ( media ) => {
	if ( ! media || ! media.items.length ) {
		return;
	}
	const itemIds = media.items.map( ( item ) => item.ID );
	this.setState( { imageIds: itemIds } );
	editProduct( siteId, product, media.items );
};
```
