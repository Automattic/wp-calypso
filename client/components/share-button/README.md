# ShareButton (JSX)

ShareButton is a component which allows you to open a popup window to share content on various services. Supported services are WordPress, Facebook, Twitter, LinkedIn, Tumblr, Pinterest and Telegram.

---

## How to use

```js
import ShareButton from 'calypso/components/share-button';

function MyButton() {
	const service = {
		url: 'https://wordpress.com/post/<SITE_SLUG>?url=<URL>&title=<TITLE>&text=&v=5',
		windowArg: 'width=600,height=570,toolbar=0,resizeable,scrollbars,status',
	};

	return (
		<ShareButton
			size={ 48 }
			url="https://wordpress.com"
			title="Share your thoughts and ideas on WordPress.com"
			service={ service }
		/>
	);
}
```

---

## Props

- `size`: (string) The size of the button
- `url`: (string) The URL of the content to share
- `title`: (string) The title of the content to share
- `service`: (object) The serice to share on - contains a `url` and `windowArg` to append to the URL

A full list of supported services and associated URLs and windowArgs are at `components/share-button/servicesjs`.
