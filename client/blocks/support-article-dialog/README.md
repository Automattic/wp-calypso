# Support Article Dialog

The `SupportArticleDialog` component displays a support article right in Calypso, enabling you to get useful content in front of folks without the need to link away from the app - giving a better and faster experience!

The component is rendered from our main `<Layout />` component and so is available everywhere in Calypso.

## Basic usage

To launch a support article call the corresponding redux action, like so:

```jsx
import { openSupportArticleDialog } from 'calypso/state/inline-support-article/actions';

function onSupportLinkClick() {
	const { postId, postUrl } = this.props;
	this.props.openSupportArticleDialog( { postId, postUrl } );
}
function render() {
	return <Button onClick={ this.onSupportLinkClick }>Read More...</Button>;
}
```

You'll notice that two properties were passed in to the `openSupportArticleDialog` action.
These two properties are then made available to `SupportArticleDialog` via redux, and are explained below.

## Props

- `postId`: (required) An id used to query the support article and get its contents.
- `postUrl`: A user-friendly url to be used to render an external link to the article, at the bottom of the dialog.
