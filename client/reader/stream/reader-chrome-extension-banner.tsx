import { useTranslate } from 'i18n-calypso';
import Banner from 'calypso/components/banner';

const CHROME_WEB_STORE_URL =
	'https://chromewebstore.google.com/detail/wordpresscom-reader-new-t/placeholder-id';

export const ReaderChromeExtensionBanner = () => {
	const translate = useTranslate();

	return (
		<Banner
			horizontal
			callToAction={ translate( 'Add to Chrome' ) }
			href={ CHROME_WEB_STORE_URL }
			target="_blank"
			title={ translate( 'Never miss a post' ) }
			description={ translate(
				'Install our Chrome extension to make the Reader your new tab page — your favorite blogs, right where you start.'
			) }
			tracksImpressionName="calypso_reader_chrome_extension_banner_view"
			tracksClickName="calypso_reader_chrome_extension_banner_click"
			tracksDismissName="calypso_reader_chrome_extension_banner_dismiss"
		/>
	);
};
