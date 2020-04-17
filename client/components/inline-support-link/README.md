Inline Support Link
===================

This component displays a link and icon. If `props.supportPostId` is supplied, when the link is clicked a SupportArticleDialog is opened with an `ExternalLink` to the `props.supportLink`. If no `props.supportPostId` is supplied, an `ExternalLink` to the `props.supportLink` is rendered.

## Example Usage:

```js
import InlineSupportLink from 'components/inline-support-link';

render() {
	const inlineSupportProps = {
		supportLink: 'https://wordpress.com/support/audio/podcasting/',
		supportPostId: 38147,
	};
	return (
		<InlineSupportLink { ...inlineSupportProps } />
	);
}
```

## Props

- `supportPostId` - (number) The postId of the support document.
- `supportLink` - (string) The URL of the support document. If left out, no ExternalLink will be given.
- `text` - *optional* (string) The link text. Default `Learn more`
- `showText` - *optional* (bool) Whether or not to display the link text. Default `true`.
- `showIcon` - *optional* (bool) Whether or not to display the "help-outline" Gridicon. Default `true`.
- `iconSize` - *optional* (number) Gridicon size. Default `14`.
- `tracksEvent` - *optional* (string) Tracks Analytics Event name
- `tracksOptions` - *optional* (object) Tracks Analytics options
- `statsGroup` - *optional* (string) Stat analytics group name
- `statsName` - *optional* (string)  Stat analytics name
