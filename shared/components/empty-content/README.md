Empty Content
=============

This module provides a consistent rendering component for empty content cases in Calypso's sections. Empty content should be used to display an alternate layout when the user has no data of a given resource. Not to be confused with subsets of data being contextually empty (searches, filters, etc.). The component accepts a set of predefined properties.

## Usage

```js

// require the component
var EmptyContentComponent = require( 'components/empty-content' );

// Render the component
React.render(
	EmptyContentComponent({
		title: "You don't have any content yet.",
		line: 'Would you like to create some?'
	}),
	document.getElementById( 'primary' )
);

// Or as an inline component
var EmptyContent = require( 'components/empty-content' );

// And use it inline inside the render method of another component
render: function() {
	return(
		<div>
			<EmptyContent title="Your title" line="some text" />
		</div>
	);
}

```

## Properties

* <strong>title</strong> — The title to be displayed.
* <strong>line</strong> — (optional) A secondary line, usually leads to the call to action.
* <strong>illustration</strong> — (optional) The url string of an image path. Displays drake illustration by default.
* <strong>illustrationWidth</strong> — (optional) Will display the image at native width unless a specific width is provided.
* <strong>action</strong> — (optional) Label or React element used for the primary action button.
* <strong>actionURL</strong> — (optional) `href` value for the primary action button.
* <strong>actionCallback</strong> — (optional) `onClick` value for the primary action button.
* <strong>actionTarget</strong> - (optional) If ommitted, no target attribute is specified.

The component also supports a secondary action. This should be used sparingly.

* <strong>secondaryAction</strong> — (optional) Label or React element used for the secondary action button.
* <strong>secondaryActionURL</strong> — (optional) `href` value for the secondary action button.
* <strong>secondaryActionCallback</strong> — (optional) `onClick` value for the secondary action button.
* <strong>secondaryActionTarget</strong> - (optional) If ommitted, no target attribute is specified.

### Example: Sites

```
React.render(
	EmptyContentComponent({
		title: "You don't have any WordPress sites yet.",
		line: 'Would you like to start one?',
		action: 'Create Site',
		actionURL: config( 'signup_url' ) + '?ref=calypso-section'
	}),
	document.getElementById( 'primary' )
);
