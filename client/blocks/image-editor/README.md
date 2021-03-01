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

This object needs to contain at least one of these properties:

`media.URL` `{string}`: the `url` of the image to be edited (e.g. `https://my-site.com/full-width1-e1.jpg`).
Use this approach if you want to load and edit a remote image file.

or

`media.src` `{string}`: the [object url](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) of
the image to be edited. Use this approach if you want to edit a local image file (e.g. uploaded file or blob).

It can also contain these optional properties (with defaults if not set):

- `media.file` `{string}`: the base name of the edited image file (e.g. `full-width1-e1.jpg`), defaults to `default`
- `media.ID` `{number}`: An ID of the media item.
- `media.mime_type` `{string}`: the MIME of the edited image (e.g. `image/jpeg`), defaults to `image/png`
- `media.title` `{string}`: the title of the edited image (e.g. `some image file`), defaults to `default`

### `defaultAspectRatio`

<table>
	<tr><th>Type</th><td>string</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td>'FREE'</td></tr>
</table>

Default, pre-selected aspect ratio for the image editor. If `allowedAspectRatios` prop is present as well,
it must include the `defaultAspectRatio`. For the list of all possible aspect ratios, see
`client/state/editor/image-editor/constants`.

### `allowedAspectRatios`

<table>
	<tr><th>Type</th><td>array</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td>all possible aspect ratios</td></tr>
</table>

List allowed aspect ratios user can select when editing an image. If there is only a single specified aspect ratio in
the `allowedAspectRatios` array, it will be set as `defaultAspectRatio` as well.
For the list of all possible aspect ratios, see `client/state/editor/image-editor/constants`.

### `onDone`

<table>
	<tr><th>Type</th><td>Function</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

A function which will get called on extracting an edited image after clicking the "Done" button.
It receives three arguments:

- a JS `Error` object if image is not loaded/present, otherwise `null`
- the extracted image in form of `Blob` object or `null` if image is not loaded/present
- the props of the image editor which include image meta and functions to reset image editor state (for the full list,
  have a look into the `image-editor/index` file)

### `onCancel`

<table>
	<tr><th>Type</th><td>Function</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

A function which will get called on clicking the "Cancel" image editor button. If this prop is omitted, the "Cancel"
button won't be rendered. The function receives one argument: the props of the image editor.

### `onReset`

<table>
	<tr><th>Type</th><td>Function</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

A function which will get called on clicking the "Reset" image editor button. The function is called after image editor's
state is reset. The function receives one argument: the props of the image editor.

### `className`

<table>
	<tr><th>Type</th><td>string</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

String of classes (class names) appended to the image editor wrapper (`.image-editor [className]`).

### `doneButtonText`

<table>
	<tr><th>Type</th><td>string</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

Already-translated string which will be used on the 'Done' button. If not used, it will default to 'Done'.

## Example

```js
import ImageEditor from 'calypso/blocks/image-editor';

function render() {
	return <ImageEditor siteId={ siteId } media={ { URL: 'http://example.com/image.jpg' } } />;
}
```
