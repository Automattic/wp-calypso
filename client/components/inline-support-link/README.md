# Inline Support Link

This component displays a link and icon.

If `props.supportPostId` is supplied, when the link is clicked a SupportArticleDialog is opened with an `ExternalLink` to the `props.supportLink`. If no `props.supportPostId` is supplied, an `ExternalLink` to the `props.supportLink` is rendered. These props are now stored in context-links.js; you should not need to provide them directly within the function anymore, see new example usage.

The component's `children` prop will be used for the link text; if none is supplied, it will defaut to the text "Learn more". The `showText` property (default `true`) can be set to `false` in order to display no text.

## Example Usage (deprecated)

```js
import { localizeUrl } from '@automattic/i18n-utils';
import InlineSupportLink from 'calypso/components/inline-support-link';

function Link() {
	const inlineSupportProps = {
		supportLink: localizeUrl( 'https://wordpress.com/support/audio/podcasting/' ),
		supportPostId: 38147,
	};
	return <InlineSupportLink { ...inlineSupportProps }>Link Text</InlineSupportLink>;
}
```

## Example Usage

```js
import InlineSupportLink from 'calypso/components/inline-support-link';

function Link() {
	return <InlineSupportLink supportContext="purchases" showIcon={ false } />;
}
```

The `supportContext` is a combination of the `supportPostId` and `supportLink` found in _context-links.js_.

```js
import { localizeUrl } from '@automattic/i18n-utils';
const contextLinks = {
	// ...
	purchases: {
		link: localizeUrl( 'https://wordpress.com/support/manage-purchases/' ),
		post_id: 111349,
	},
	// ...
};
```

## Props

- `supportContext` - (string) The slug used to define the `supportPostId` and `supportLink` in _context-links.js_
- `supportPostId` - (number) The postId of the support document.
- `supportLink` - (string) The URL of the support document. If left out, no ExternalLink will be given.
- `showText` - _optional_ (bool) Whether or not to display the link text. Default `true`.
- `showIcon` - _optional_ (bool) Whether or not to display the "help-outline" Gridicon. Default `true`.
- `iconSize` - _optional_ (number) Gridicon size. Default `14`.
- `linkTitle` - _optional_ (string) Text to use in the link's `title=` attribute.
- `tracksEvent` - _optional_ (string) Tracks Analytics Event name
- `tracksOptions` - _optional_ (object) Tracks Analytics options
- `statsGroup` - _optional_ (string) Stat analytics group name
- `statsName` - _optional_ (string) Stat analytics name
