# Video Editor

`VideoEditor` is a block component which enables the selection of a frame or the uploading of a custom image
to serve as the video poster.

It requires a `media` object to work properly.

## Props

### `className`

<table>
	<tr><th>Type</th><td>string</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

String of classes (class names) appended to the video editor wrapper (`.video-editor [className]`).

### `media`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

This object needs to contain the following property:

`media.videopress_guid` `{string}`: The unique identifier of the video (e.g. 'kUJmAcSf').

It can also contain these optional properties (with defaults set by VideoPress):

- `media.width` `{number}`: The width of the video. Defaults to `854`.
- `media.height` `{number}`: The height of the video. Defaults to `480`.

### `onCancel`

<table>
	<tr><th>Type</th><td>Function</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

A function which will get called on clicking the "Cancel" video editor button. If this prop is omitted, the "Cancel"
button won't be rendered.

### `onUpdatePoster`

<table>
	<tr><th>Type</th><td>Function</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

A function which will get called after selecting a frame or uploading a custom image.
It receives one argument:

- the props of the video editor which include the poster URL and the ID of the media item.

## Example

```js
import VideoEditor from 'calypso/blocks/video-editor';

function render() {
	return <VideoEditor media={ { videopress_guid: 'kUJmAcSf' } } />;
}
``;
```
