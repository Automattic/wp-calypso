# Empty Content

EmptyContent is used when a customer has no data to show. This is an opportunity to provide explanation or guidance to help customer progress. The EmptyContent is intended for use when a full view is empty, and not for individual elements or areas in the interface.

## Usage

### As a full view component

```jsx
// import the component
import EmptyContentComponent from 'calypso/components/empty-content';

// Render the component
function show( context, next ) {
	context.primary = <EmptyContentComponent title="Your title" line="Some text" />;
	next();
}
```

### As an inline component

```jsx
import EmptyContent from 'calypso/components/empty-content';

// Use it inline inside the render method of another component
function render() {
	return (
		<div>
			<EmptyContent title="Your title" line="Some text" />
		</div>
	);
}
```

## Props

| Name                | Type            | Default                                  | Description                                                                 |
| ------------------- | --------------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| `title`\*           | `string`        | `'You haven't created any content yet.'` | The title to be displayed.                                                  |
| `line`              | `string`        | `null`                                   | A secondary line, usually leads to the call to action.                      |
| `illustration`      | `url`           | `null`                                   | The url string of an image path. Null to omit an illustration.              |
| `illustrationWidth` | `number`        | `null`                                   | Will display the image at native width unless a specific width is provided. |
| `action`            | `string/object` | `null`                                   | Label or React element used for the primary action button.                  |
| `actionURL`         | `string`        | `null`                                   | `href` value for the primary action button.                                 |
| `actionCallback`    | `function`      | `null`                                   | `onClick` value for the primary action button.                              |
| `actionTarget`      | `string`        | `null`                                   | If omitted, no target attribute is specified.                               |
| `actionDisabled`    | `bool`          | `null`                                   | Disables the button.                                                        |
| `actionRef`         | `function`      | `null`                                   | Adds a ref to the button.                                                   |
| `isCompact`         | `bool`          | `false`                                  | Shows a smaller version of the component.                                   |

### Additional props

The component also supports a secondary action. This should be used sparingly.

| Name                      | Type            | Default | Description                                                  |
| ------------------------- | --------------- | ------- | ------------------------------------------------------------ |
| `secondaryAction`         | `string/object` | `null`  | Label or React element used for the secondary action button. |
| `secondaryActionURL`      | `string`        | `null`  | `href` value for the secondary action button.                |
| `secondaryActionCallback` | `function`      | `null`  | `onClick` value for the secondary action button.             |
| `secondaryActionTarget`   | `string`        | `null`  | If omitted, no target attribute is specified.                |

### Example: Sites

```js
<EmptyContentComponent
	title="You don't have any WordPress sites yet."
	line="Would you like to start one?"
	action="Create Site"
	actionURL={ config( 'signup_url' ) + '?ref=calypso-section' }
/>
```

## General guidelines

- Use the correct tone.
- Use simple and clear language that empowers customers to move forward.
- Be encouraging and never make customers feel unsuccessful or guilty because they haven’t used a product or feature.
- Explain the steps a customer needs to take to activate a product or feature.
- Use only one **primary** call-to-action button.
- Ensure that any illustrations are on-brand.
