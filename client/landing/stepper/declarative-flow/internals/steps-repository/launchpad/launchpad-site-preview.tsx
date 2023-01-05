import { FEATURE_VIDEO_UPLOADS, planHasFeature } from '@automattic/calypso-products';
import { DEVICE_TYPES } from '@automattic/components';
import { NEWSLETTER_FLOW } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import WebPreview from 'calypso/components/web-preview/component';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { isVideoPressFlow } from 'calypso/signup/utils';
import { usePremiumGlobalStyles } from 'calypso/state/sites/hooks/use-premium-global-styles';
import PreviewToolbar from '../design-setup/preview-toolbar';
import type { Device } from '@automattic/components';

const LaunchpadSitePreview = ( {
	siteSlug,
	flow,
}: {
	siteSlug: string | null;
	flow: string | null;
} ) => {
	const translate = useTranslate();
	const { globalStylesInUse, shouldLimitGlobalStyles } = usePremiumGlobalStyles();
	const site = useSite();

	let previewUrl = siteSlug ? 'https://' + siteSlug : null;
	const devicesToShow: Device[] = [ DEVICE_TYPES.COMPUTER, DEVICE_TYPES.PHONE ];
	let defaultDevice = flow === NEWSLETTER_FLOW ? DEVICE_TYPES.COMPUTER : DEVICE_TYPES.PHONE;
	let loadingMessage = translate( '{{strong}}One moment, please…{{/strong}} loading your site.', {
		components: { strong: <strong /> },
	} );

	if ( isVideoPressFlow( flow ) ) {
		const windowWidth = window.innerWidth;
		defaultDevice = windowWidth >= 1000 ? DEVICE_TYPES.COMPUTER : DEVICE_TYPES.PHONE;
		const productSlug = site?.plan?.product_slug;
		const isVideoPressFlowWithUnsupportedPlan = ! planHasFeature(
			productSlug as string,
			FEATURE_VIDEO_UPLOADS
		);

		if ( isVideoPressFlowWithUnsupportedPlan ) {
			previewUrl = null;
			loadingMessage = translate(
				'{{strong}}Site preview not available.{{/strong}} Plan upgrade is required.',
				{
					components: { strong: <strong /> },
				}
			);
		}
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
				loadingMessage={ loadingMessage }
				translate={ translate }
				defaultViewportDevice={ defaultDevice }
				devicesToShow={ devicesToShow }
				showSiteAddressBar={ false }
			/>
		</div>
	);
};

export default LaunchpadSitePreview;
