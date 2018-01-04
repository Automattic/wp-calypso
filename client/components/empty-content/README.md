Empty Content
=============

This module provides a consistent rendering component for empty content cases in Calypso's sections. EmptyContent should be used to display an alternate layout when the user has no data of a given resource. Not to be confused with subsets of data being contextually empty (searches, filters, etc.). The component accepts a set of predefined properties.

## Usage

```jsx
// import the component
import EmptyContentComponent from 'components/empty-content';

// Render the component
ReactDom.render(
	EmptyContentComponent( {
		title: "You don't have any content yet.",
		line: 'Would you like to create some?'
	} ),
	document.getElementById( 'primary' )
);

// Or as an inline component
import EmptyContent from 'components/empty-content';

// And use it inline inside the render method of another component
render() {
	return(
		<div>
			<EmptyContent title="Your title" line="some text" />
		</div>
	);
}

```

## Properties

* **title** — The title to be displayed.
* **line** — (optional) A secondary line, usually leads to the call to action.
* **illustration** — (optional) The url string of an image path. Displays drake illustration by default.
* **illustrationWidth** — (optional) Will display the image at native width unless a specific width is provided.
* **action** — (optional) Label or React element used for the primary action button.
* **actionURL** — (optional) `href` value for the primary action button.
* **actionCallback** — (optional) `onClick` value for the primary action button.
* **actionTarget** - (optional) If ommitted, no target attribute is specified.

The component also supports a secondary action. This should be used sparingly.

* **secondaryAction** — (optional) Label or React element used for the secondary action button.
* **secondaryActionURL** — (optional) `href` value for the secondary action button.
* **secondaryActionCallback** — (optional) `onClick` value for the secondary action button.
* **secondaryActionTarget** - (optional) If ommitted, no target attribute is specified.

### Example: Sites

```es6
ReactDom.render(
	EmptyContentComponent( {
		title: "You don't have any WordPress sites yet.",
		line: 'Would you like to start one?',
		action: 'Create Site',
		actionURL: config( 'signup_url' ) + '?ref=calypso-section'
	} ),
	document.getElementById( 'primary' )
);
```
