import { NEWSLETTER_FLOW, VIDEOPRESS_FLOW } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { number } from 'yargs';
import { DEVICE_TYPE } from 'calypso/../packages/design-picker/src/constants';
import { Device } from 'calypso/../packages/design-picker/src/types';
import { useSitePreviewLinks } from 'calypso/components/site-preview-link/use-site-preview-links';
import WebPreview from 'calypso/components/web-preview/component';
import { usePremiumGlobalStyles } from 'calypso/state/sites/hooks/use-premium-global-styles';
import PreviewToolbar from '../design-setup/preview-toolbar';

interface PreviewLink {
	code: number;
	created_at: string;
}

function getPreviewCode( links: PreviewLink[] ) {
	if ( typeof links === 'undefined' ) {
		return false;
	}
	const link = links[ 0 ];
	return link.code ?? false;
}

const LaunchpadSitePreview = ( {
	siteSlug,
	flow,
}: {
	siteSlug: string | null;
	flow: string | null;
} ) => {
	const siteId = siteSlug || '';
	const { data: previewLinks, isLoading: isPreviewLinksLoading } = useSitePreviewLinks( {
		siteId,
	} );
	const share = getPreviewCode( previewLinks );
	const translate = useTranslate();
	const { globalStylesInUse, shouldLimitGlobalStyles } = usePremiumGlobalStyles();

	const previewUrl = siteSlug ? 'https://' + siteSlug : null;
	const devicesToShow: Device[] = [ DEVICE_TYPE.COMPUTER, DEVICE_TYPE.PHONE ];
	let defaultDevice = flow === NEWSLETTER_FLOW ? DEVICE_TYPE.COMPUTER : DEVICE_TYPE.PHONE;
	const isVideoPressFlow = VIDEOPRESS_FLOW === flow;

	if ( isVideoPressFlow ) {
		const windowWidth = window.innerWidth;
		defaultDevice = windowWidth >= 1000 ? DEVICE_TYPE.COMPUTER : DEVICE_TYPE.PHONE;
	}

	function formatPreviewUrl() {
		if ( ! previewUrl ) {
			return null;
		}
		if ( ! ( isPreviewLinksLoading || share ) ) {
			return null;
		}

		return addQueryArgs( previewUrl, {
			share,
			iframe: true,
			theme_preview: true,
			// hide the "Create your website with WordPress.com" banner
			hide_banners: true,
			// hide cookies popup
			preview: true,
			do_preview_no_interactions: ! isVideoPressFlow,
			...( globalStylesInUse && shouldLimitGlobalStyles && { 'preview-global-styles': true } ),
		} );
	}

	return (
		<div className="launchpad__site-preview-wrapper">
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
