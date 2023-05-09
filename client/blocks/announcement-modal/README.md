# AnnouncementModal (JSX)

This block displays an announcement modal that after being dismissed it
won't display again. It can support multiple announcements (pages).

## How to use

```js
import AnnouncementModal from 'calypso/blocks/announcement-modal';
import PlaceholderImage from 'calypso/images/extensions/woocommerce/image-placeholder.png';

const pages = [
	{
		heading: 'All the plugins and more',
		content:
			'This page may look different as we’ve made some changes to improve the experience for you. Stay tuned for even more exciting updates to come!',
		featureImage: PlaceholderImage,
	},
	{
		heading: 'All the plugins and more Page 2',
		content:
			'This page may look different as we’ve made some changes to improve the experience for you. Stay tuned for even more exciting updates to come!',
		featureImage: PlaceholderImage,
	},
];

function render() {
	return <AnnouncementModal announcementId="my-new-super-duper-feature" pages={ pages } />;
}
```

## Props

- `pages` (`{ heading: string; connten: string; featureImage: string }[]`) - The pages to be shown inside the modal.
- `announcementId` (`string`) - ID for the announcement. It will be used to dismiss the announcement.
