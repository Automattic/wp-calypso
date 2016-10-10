# Image Editor

`ImageEditor` is a block component which enables basic image editing functionality such as:
- cropping, resizing
- rotating,
- changing aspect ratio
- flipping
- resetting to original state

It requires a `media` object to work properly. You can also pass a site ID to which the edited image belongs to.

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td>selected site</td></tr>
</table>

Id of a site the edited image belongs to.

### `media`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

This object needs to contain at least these properties:
- `media.URL` `{string}`: the `url` of the image to be edited (e.g. `https://my-site.com/full-width1-e1.jpg`)

It can also contain these optional properties (with defaults if not set):
- `media.file` `{string}`: the base name of the edited image file (e.g. `full-width1-e1.jpg`), defaults to `default`
- `media.mime_type` `{string}`: the MIME of the edited image (e.g. `image/jpeg`), defaults to `image/png`
- `media.title` `{string}`: the title of the edited image (e.g. `some image file`), defaults to `default`

### `onImageEditorSave`

<table>
	<tr><th>Type</th><td>Function</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

A function which will get called on saving an edited image (closing with saving).

### `onImageEditorCancel`

<table>
	<tr><th>Type</th><td>Function</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

A function which will get called on cancelling the image editor (closing without saving).

### `additionalClasses`

<table>
	<tr><th>Type</th><td>string</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

String of classes (class names) appended to the image editor wrapper (`.image-editor [additionalClasses]`).

## Example

```js
import ImageEditor from 'blocks/image-editor';

render() {
	return (
		<ImageEditor
			siteId={ siteId }
			media={ { URL: 'http://example.com/image.jpg' } }
		/>
	);
}
``

