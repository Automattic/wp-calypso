Overlay
=======

### This module is deprecated. Please don't use for new code







Renders the overlay masterbar and their actions.

#### How to use?

Make use of it as a React component. It handles its own unmounting and body-classes wrangling for showing and animating the overlay and removing the overlay.

```javascript
var Overlay = require( 'components/overlay' );

var Component = React.createClass({
	render: function() {
		return (
			<Overlay>
				<div id="overlay-secondary"><ul class="sidebar"><li>item #1</li></ul></div>
				<div id="overlay-primary"><div>My Neat Component Logic Here</div></div>
			</Overlay>
		);
	}
});
```

### Customize Props

You can also customize pass in the following props to the component to customize it further:

* 'context': A page.js context object that is used to automatically figure out what url to use for the secondary action.
* 'primary': `primary` is useful as a call-to-action. You can customize the primary action by passing in an object with the following attributes - or omit to have no primary button shown.
  * 'title': The text for the button.
  * 'action': The onClick action when the button is pressed.
* 'secondary': `secondary` is useful as a cancel or done button and can be used without a `primary` action. Omitting this prop will result in a `Done` button with the default options. To remove the `secondary` button, pass a falsey value. You can pass in a configruation object with the following nodes:
  * 'title': (optional) The text for the button. Default is 'Done'
  * 'defaultBack': (optional) The default `back` location to return to if there is no previous page in the browser history. Default is `/sites`.
  * 'action': (optional) An onClick action to take when the secondary button is clicked.

```javascript
var Overlay = require( 'components/overlay' ),
	primary = { action: this.myClickHandler, title: 'Title Of Button' };

var Component = React.createClass({
	render: function() {
		return (
			<Overlay primary={ primary }>
				<div id="overlay-secondary"><ul class="sidebar"><li>item #1</li></ul></div>
				<div id="overlay-primary"><div>My Neat Component Logic Here</div></div>
			</Overlay>
		);
	}
});
```

The following would not show a primary button, and the secondary button would be shown with the title of _Donezo_:

```javascript
var Overlay = require( 'components/overlay' ),
	secondary = { title: 'Donezo' };
	primary = null;

var Component = React.createClass({
	render: function() {
		return (
			<Overlay primary={ primary } secondary={ secondary }>
				<div id="overlay-secondary"><ul class="sidebar"><li>item #1</li></ul></div>
				<div id="overlay-primary"><div>My Neat Component Logic Here</div></div>
			</Overlay>
		);
	}
});

* 'sectionID': Used as the class for the wrapping `<section>` element.
```
