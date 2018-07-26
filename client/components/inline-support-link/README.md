Inline Support Link
===================

This component displays a link and icon. When clicked, it opens a SupportArticleDialog with an ExternalLink to the article if supplied.

## Example Usage:

```js
import InlineSupportLink from 'components/inline-support-link';

render() {
	const inlineSupportProps = {
		text: 'Learn more about Podcasting',
		supportLink: 'https://en.support.wordpress.com/audio/podcasting/',
		supportPostId: 'https://example.com/#privacy',
	};
	return (
		<InlineSupportLink { ...inlineSupportProps } />
	);
}
```

## Props

- `supportPostId` - (number) The postId of the support document.
- `supportLink` - *optional* (string) The URL of the support document. If left out, no ExternalLink will be given.
- `text` - *optional* (string) The link text. Default `Learn more`
- `showText` - *optional* (bool) Whether or not to display the link text. Default `true`.
- `showIcon` - *optional* (bool) Whether or not to display the "help-outline" Gridicon. Default `true`.
- `iconSize` - *optional* (number) Gridicon size. Default `14`.
