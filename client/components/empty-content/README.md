Empty Content
===

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

### Props

Name | Type | Default | Description
--- | --- | --- | ---
`title`* | `string` | `'You haven't created any content yet.'` | The title to be displayed.
`line` | `string` | `null` | A secondary line, usually leads to the call to action.
`illustration` | `url` | `'/calypso/images/illustrations/illustration-empty-results.svg'` | The url string of an image path. Displays drake illustration by default.
`illustrationWidth` | `number` | `null` | Will display the image at native width unless a specific width is provided.
`action` | `string/object` | `null` | Label or React element used for the primary action button.
`actionURL` | `string` | `null` | `href` value for the primary action button.
`actionCallback` | `function` | `null` | `onClick` value for the primary action button.
`actionTarget` | `string` | `null` | If ommitted, no target attribute is specified.
`actionHoverCallback`* | `bool` | `0` | Indicates activity while a background action is being performed
`isCompact` | `bool` | `false` | Shows a smaller version of the component

### Additional props
The component also supports a secondary action. This should be used sparingly.

Name | Type | Default | Description
--- | --- | --- | ---
`secondaryAction` | `string/object` | `null` | Label or React element used for the secondary action button.
`secondaryActionURL` | `string` | `null` | `href` value for the secondary action button.
`secondaryActionCallback` | `fuction` | `null` | `onClick` value for the secondary action button.
`secondaryActionTarget` | `string` | `null` | If ommitted, no target attribute is specified.

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
