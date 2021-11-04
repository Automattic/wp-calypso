import AnnouncementModal from 'calypso/blocks/announcement-modal';
import PlaceholderImage from 'calypso/images/extensions/woocommerce/image-placeholder.png';

export default function AnnouncementModalExample() {
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
	return <AnnouncementModal announcementId="my-new-super-duper-feature" pages={ pages } />;
}
