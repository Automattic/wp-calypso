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

It is strongly recommended to replace `YOUR_NOTICE_ID_PREFIX` with a unique string that represents your component.
The prefix will be prepended to all notice ID in the component.

Once your component is mounted, it will have `notices` property contains seven helper functions.

## Create notices

To create a notice you can use one of the following functions.
Every function represents a unique status and every status has its own color and icon.

* `notices.success()`
* `notices.error()`
* `notices.info()`
* `notices.warning()`
* `notices.update()`

All functions will return the created notice's ID. For example the following code will create a green and dismissable global notice and assign its ID to `noticeId`.

```js
// In a component method
var noticeId = this.notices.success( 'Text to display' );
```

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

Notices can be dismissed by calling `notices.removeNotice()` helper function that takes notice ID as only argument. Let's say you want to close a notice and its id is `example-notice-1`. The code will look like:

```js
// In a component method
this.notices.removeNotice( 'example-notice-1' );
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

## Without Mixins

Though ES2015 classes don't support mixins we can still take advantage of
`noticeMixin` module using `getHelpers`.

Let's imagine you want to show a global notice when a component is mounted.
The code will look like:

```js
/* ... */
import { getHelpers } from 'lib/mixins/notice';

class YourComponent extends React.Component {
	/* ... */

	componentDidMount() {
		this.notices = getHelpers( this, 'YOUR_NOTICE_ID_PREFIX' );

		this.notices.info( 'YourComponent is mounted!', { button: 'Action', showDismiss: false } );
	}

	componentWillUnmount() {
		// For ES2015 classes you have to unsubscribe the store change event manually.
		this.notices.unsubscribe();
	}

	onNoticeActionClick( noticeId ) {
		/* Do something when a notice action button is clicked */
	}

	/* ... */
}

// You don't need this statement if the redux store is passed as a prop to the component
YourComponent.contextTypes = {
	store: React.PropTypes.object
};

```
