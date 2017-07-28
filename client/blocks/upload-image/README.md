Upload Image
=========

`UploadImage` component is used to accommodate the following flow:
- click on a designated place to open file explorer
- in file explorer, select an image to upload
- image is moved to `ImageEditor` where user can edit the image before uploading
- after clicking on "Done", `UploadImage` calls the `onImageEditorDone` handler where you can perform any operation
- after clicking on "Done", image is automatically uploaded to the supplied `siteId` Media library
- after the upload is complete, `onUploadImageDone` is called with the uploaded image props (such as URL, ID, etc)

If there's any error during the above flow, the error with its error code will be passed to the `onError` function.

#### Basic usage:

```js
import UploadImage from 'blocks/upload-image';

render: function() {
	return
		<UploadImage 
			siteId={ <your-site-id> or currently selected siteId if not specified }
			onUploadImageDone={ ( uploadedImage ) => console.log( uploadedImage.ID ) }
		/>;
}
```

To see a more complex example, have a look at `blocks/upload-image/docs/example`.

#### Props

- `imageEditorProps`: (default: allowedAspectRatios set to 1X1) object of additional props to send to `ImageEditor`
	component.
- `onImageEditorDone`: (default: `noop`) function to call when user clicks on the "Done" button in `ImageEditor`.
- `onError`: (default: `noop`) function to call when there's any error during file uploading/image editing.
- `onUploadImageDone`: (default: `noop`) function to call when the image is uploaded to specified `siteId` Media library.
- `additionalImageEditorClasses`: string of additional CSS class names to apply to the `ImageEditor` modal.
- `additionalClasses`: string of additional CSS class names to apply to the `UploadImage` component.
- `doneButtonText`: text on the "Done" button in Image Editor modal.
- `addAnImageText`: text on the image picker when selecting an image.
- `dragUploadText`: text which shows when dragging an image to upload.

There's a way to design and supply your own HTML for the image picker (when no image is selected) by supplying the
`imagePickerContent` prop and for the uploading process (when image is being uploaded) by supplying the
`uploadingContent` prop. You can also supply your own HTML for when image is uploaded to Media library by passing the
`uploadingDoneContent` prop.
