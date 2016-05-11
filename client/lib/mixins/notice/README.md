Notice Mixin
=============

This React mixin provides some helper functions to render a notice on the UI. Types of notices are `success`, `error`, `info`, `warning` and `update`.

> Note: Notice mixin needs to access redux store. So, a root component should be wrapped in `<Provider>`.

## How to use

To use the notice helpers, add Notice mixin to the components you want to enhance.

```js
/* ... */
import noticeMixin from 'lib/mixins/notice';

var YourComponent = React.createClass({
	mixins: [ noticeMixin( 'YOUR_NOTICE_ID_PREFIX' ) ],

	/* ... */
});
```

It is strongly recommended to replace `YOUR_NOTICE_ID_PREFIX` with a unique string that represents your component. The prefix will be prepended to all notice ID in the component.

## Create notices

This mixin exposes five public methods that create notices. Every method represents a unique status and every status has its own color and icon.

* `.successNotice()`
* `.errorNotice()`
* `.infoNotice()`
* `.warningNotice()`
* `.updateNotice()`

### Options

The first argument is the text to be displayed on the notice. The second argument is an optional object and accepts some properties:

* `overlay: true`: (optional) To indicate the notice should be rendered within the overlay.
* `button: 'Label'`: (optional) Text label to display on action button.
* `href: 'https://wordpress.com'`: (optional, requires `button` to be set as well) Url to be used for the button action.
* `duration: 5000`: (optional) Duration in milliseconds to display the notice before dismissing.
* `isCompact: true`: (optional) Applies the `is-compact` class (and related styles) to the notice. Makes the notice smaller and more compact.
* `displayOnNextPage: true`: (optional) Displays the notice on the next page load rather than this one. Useful for showing a notice after a redirect.
* `showDismiss: false`: (optional) To indicate if dismiss button should be rendered within the overlay.
* `persistent: true`: (optional) When set to true it won't be removed from the page when navigating to the next page.

## Close notices

Notices can be dismissed by calling `removeNotice()` method that takes notice ID as only argument. Let's say you want to close a notice and its id is `example-notice-1`. The code will look like:

```js
// In a component method
this.removeNotice( 'example-notice-1' );
```

## Notice Action

When you click an action button its parent notice will be closed. If you want to do something before the notice is dismissed, define `onNoticeActionClick()` method accepts a notice ID as only argument. For instance, the following code will log the notice ID to the browser console and close the notice.

```js
/* ... */
import noticeMixin from 'lib/mixins/notice';

var YourComponent = React.createClass({
	mixins: [ noticeMixin( 'YOUR_NOTICE_ID_PREFIX' ) ],

	// You have to define this method if you want to do something when an action button is clicked.
	// Otherwise, it just closes the parent notice component of clicked action button.
	onNoticeActionClick( noticeId ) {
		// log the notice ID to the browser console.
		console.log( 'Notice ID:', noticeId );

		// the notice is going to be closed automatically
	},

	/* ... */
});
```

If you need to do an async task, just return a promise.

```js
/* ... */
import noticeMixin from 'lib/mixins/notice';

var YourComponent = React.createClass({
	mixins: [ noticeMixin( 'YOUR_NOTICE_ID_PREFIX' ) ],

	onNoticeActionClick( noticeId ) {
		return new Promise( (resolve, reject) => {
			// log the notice ID to the browser console.
			console.log( 'Notice ID:', noticeId );

			// do something asynchrounous
			// ...

			resolve();
		} );
	},

	/* ... */
});
```
