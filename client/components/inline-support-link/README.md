# Inline Support Link

This component displays a link and icon. If `props.supportPostId` is supplied, when the link is clicked a SupportArticleDialog is opened with an `ExternalLink` to the `props.supportLink`. If no `props.supportPostId` is supplied, an `ExternalLink` to the `props.supportLink` is rendered.

The component's `children` prop will be used for the link text; if none is supplied, it will defaut to the text "Learn more". The `showText` property (default `true`) can be set to `false` in order to display no text.

## Example Usage

```js
import InlineSupportLink from 'calypso/components/inline-support-link';

function render() {
	const inlineSupportProps = {
		supportLink: 'https://wordpress.com/support/audio/podcasting/',
		supportPostId: 38147,
	};
	return <InlineSupportLink { ...inlineSupportProps }>Link Text</InlineSupportLink>;
}
```

## Props

- `supportPostId` - (number) The postId of the support document.
- `supportLink` - (string) The URL of the support document. If left out, no ExternalLink will be given.
- `showText` - _optional_ (bool) Whether or not to display the link text. Default `true`.
- `showIcon` - _optional_ (bool) Whether or not to display the "help-outline" Gridicon. Default `true`.
- `iconSize` - _optional_ (number) Gridicon size. Default `14`.
- `tracksEvent` - _optional_ (string) Tracks Analytics Event name
- `tracksOptions` - _optional_ (object) Tracks Analytics options
- `statsGroup` - _optional_ (string) Stat analytics group name
- `statsName` - _optional_ (string) Stat analytics name
