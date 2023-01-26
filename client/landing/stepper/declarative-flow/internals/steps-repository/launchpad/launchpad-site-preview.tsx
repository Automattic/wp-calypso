import { FEATURE_VIDEO_UPLOADS, planHasFeature } from '@automattic/calypso-products';
import { DEVICE_TYPES } from '@automattic/components';
import { FREE_FLOW, NEWSLETTER_FLOW, BUILD_FLOW } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import WebPreview from 'calypso/components/web-preview/component';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSitePreviewShareCode } from 'calypso/landing/stepper/hooks/use-site-preview-share-code';
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
	const isInVideoPressFlow = isVideoPressFlow( flow );

	let previewUrl = siteSlug ? 'https://' + siteSlug : null;
	const devicesToShow: Device[] = [ DEVICE_TYPES.COMPUTER, DEVICE_TYPES.PHONE ];
	let defaultDevice = getSitePreviewDefaultDevice( flow );
	let loadingMessage = translate( '{{strong}}One moment, please…{{/strong}} loading your site.', {
		components: { strong: <strong /> },
	} );

	if ( isInVideoPressFlow ) {
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

	const { shareCode, isPreviewLinksLoading, isCreatingSitePreviewLinks } =
		useSitePreviewShareCode();

	function formatPreviewUrl() {
		if ( ! previewUrl || isPreviewLinksLoading || isCreatingSitePreviewLinks ) {
			return null;
		}

		return addQueryArgs( previewUrl, {
			...( shareCode && { share: shareCode } ),
			iframe: true,
			theme_preview: true,
			// hide the "Create your website with WordPress.com" banner
			hide_banners: true,
			// hide cookies popup
			preview: true,
			do_preview_no_interactions: ! isInVideoPressFlow,
			...( globalStylesInUse && shouldLimitGlobalStyles && { 'preview-global-styles': true } ),
		} );
	}

	function getSitePreviewDefaultDevice( flow: string | null ) {
		switch ( flow ) {
			case NEWSLETTER_FLOW:
				return DEVICE_TYPES.COMPUTER;
			case FREE_FLOW:
				return DEVICE_TYPES.COMPUTER;
			case BUILD_FLOW:
				return DEVICE_TYPES.COMPUTER;
			default:
				return DEVICE_TYPES.PHONE;
		}
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
				enableEditOverlay
			/>
		</div>
	);
};

export default LaunchpadSitePreview;
