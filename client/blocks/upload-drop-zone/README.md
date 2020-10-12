# Upload Drop Zone

A combined drop-zone and filepicker for uploading zip files. Click to open a file browser, or drop a single zip file onto it. Accepts a function that will be called with the selected file.

## Usage

```jsx
function render() {
	const doUpload = this.props.uploadTheme;

	return <UploadDropZone doUpload={ doUpload } />;
}
```

## Props

### `doUpload`

<table>
	<tr><th>Type</th><td>Function</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

Function that takes params `siteId` and `File`, which will be called when a zip file has been selected (dropped or picked).

### `disabled`

<table>
	<tr><th>Type</th><td>Boolean</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

`true` to disable the picker and dropzone.
