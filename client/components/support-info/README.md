# Support Info

This component is used to display a support info icon. When clicked, it displays a popover with a description, a learn more link, and a privacy info link.

## Example Usage

```js
import SupportInfo from 'calypso/components/support-info';

function render() {
	const support = {
		text: 'About this.',
		link: 'https://example.com/',
		privacyLink: 'https://example.com/#privacy',
	};
	return <SupportInfo { ...support } />;
}
```

## Props

- `text` - (string) A brief description of a feature.
- `link` - _optional_ (string|bool) A URL leading to an overview of a feature. If `false`, no link will be displayed.
- `privacyLink` - _optional_ (string|bool) A URL leading to the privacy information for a feature. If empty, defaults to `[link]#privacy`. If false, no privacy link will be displayed.
