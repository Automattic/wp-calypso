import { NEWSLETTER_FLOW, VIDEOPRESS_FLOW } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { DEVICE_TYPE } from 'calypso/../packages/design-picker/src/constants';
import { Device } from 'calypso/../packages/design-picker/src/types';
import WebPreview from 'calypso/components/web-preview/component';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import PreviewToolbar from '../design-setup/preview-toolbar';

const LaunchpadSitePreview = ( {
	siteSlug,
	flow,
}: {
	siteSlug: string | null;
	flow: string | null;
} ) => {
	const translate = useTranslate();
	const color = useQuery().get( 'color' );
	const previewUrl = siteSlug ? 'https://' + siteSlug : null;
	const devicesToShow: Device[] = [ DEVICE_TYPE.COMPUTER, DEVICE_TYPE.PHONE ];
	let defaultDevice = flow === NEWSLETTER_FLOW ? DEVICE_TYPE.COMPUTER : DEVICE_TYPE.PHONE;
	const isVideoPressFlow = VIDEOPRESS_FLOW === flow;

	if ( isVideoPressFlow ) {
		const windowWidth = window.innerWidth;
		defaultDevice = windowWidth >= 1430 ? DEVICE_TYPE.COMPUTER : DEVICE_TYPE.PHONE;
	}

	function formatPreviewUrl() {
		if ( ! previewUrl ) {
			return null;
		}

		return addQueryArgs( previewUrl, {
			iframe: true,
			theme_preview: true,
			// hide the "Create your website with WordPress.com" banner
			hide_banners: true,
			// hide cookies popup
			preview: true,
			do_preview_no_interactions: ! isVideoPressFlow,
			...( color && { preview_accent_color: color } ),
		} );
	}

	function preventTabbingToIFrame(): void {
		( document.querySelector( 'iframe.web-preview__frame' ) as HTMLIFrameElement ).tabIndex = -1;
	}

	return (
		<div className="launchpad__site-preview-wrapper" onLoad={ preventTabbingToIFrame }>
			<WebPreview
				className="launchpad__-web-preview"
				disableTabbing
				showDeviceSwitcher={ true }
				showPreview
				showSEO={ true }
				isContentOnly
				externalUrl={ siteSlug }
				previewUrl={ formatPreviewUrl() }
				toolbarComponent={ PreviewToolbar }
				showClose={ false }
				showEdit={ false }
				showExternal={ false }
				loadingMessage={ translate( '{{strong}}One moment, please…{{/strong}} loading your site.', {
					components: { strong: <strong /> },
				} ) }
				translate={ translate }
				defaultViewportDevice={ defaultDevice }
				devicesToShow={ devicesToShow }
				showSiteAddressBar={ false }
			/>
		</div>
	);
};

export default LaunchpadSitePreview;
