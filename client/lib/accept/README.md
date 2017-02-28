Accept
======

Accept is a stylized substitute to the browser `confirm` dialog.

![Example](https://cldup.com/FS-PWXvga0-1200x1200.png)

## Arguments

* `message` - A string that gets displayed to the user in the cofirm dialog.
* `callback` - A callback that gets called after confirms or cancels the dialog.
* `confirmButtonText` - Optional confirm button text (defaults to 'OK') OR Button element.
* `cancelButtonText` - Optional cancel button text (defaults to 'Cancel') OR Button element.

## Usage

While `confirm` returns a value synchronously, Accept must be performed asynchronously. In addition to your message, you must pass a function which will be executed upon a user's selection with the result of the confirmation.

```js
var accept = require( 'lib/accept' );

accept( 'Are you sure you want to perform this action?', function( accepted ) {
	if ( accepted ) {
		// User accepted the prompt
	} else {
		// User cancelled or otherwise closed the prompt
	}
} );
```
