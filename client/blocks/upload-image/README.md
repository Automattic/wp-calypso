Upload Image
=========

`UploadImage` component is used to accommodate the following flow:
- click on a designated place to open file explorer
- in file exploerer, select an image to upload
- image is moved to `ImageEditor` where user can edit the image before uploading
- after clicking on "Done", `UploadImage` calls the `onImageEditorDone` handler where you can perform any operation
 (such as actual uploading of the image).
 
The initial idea to create the block comes from the `edit-gravatar` one -- it's very similar but reusable and extensible.


#### Basic usage:

```js
import UploadImage from 'blocks/upload-image';

render: function() {
	return
		<UploadImage onImageEditorDone={ ( imageBlob ) => console.log( URL.createObjectURL( imageBlob ) ) } />;
}
```

To see a more complex example, have a look at `blocks/upload-image/docs/example`.

#### Props

- `isUploading`: (default: false) whether to display a spinner over selected-n-edited image (use only after user 
	selects an image in `onImageEditorDone`).
- `imageEditorProps`: (default: allowedAspectRatios set to 1X1) object of additional props to send to `ImageEditor`
	component.
- `texts`: (default: `{}`) object of different texts/messages to show.
- `onImageEditorDone`: (default: `noop`) function to call when user clicks on the "Done" button in `ImageEditor`.
- `additionalImageEditorClasses`: string of additional CSS class names to apply to the `ImageEditor` modal.
- `additionalClasses`: string of additional CSS class names to apply to the `UploadImage` component.

## Additional notes

This component could be made better (.e.g add error handling). If you need anything more of it, feel free to extend it
as needed. It's main use is in the Simple Payments project ("Add Payment Button" in Editor) and it was built to
accommodate its needs.
