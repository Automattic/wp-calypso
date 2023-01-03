import { isWpComBusinessPlan, isWpComEcommercePlan } from '@automattic/calypso-products';
import { DEVICE_TYPES } from '@automattic/components';
import { NEWSLETTER_FLOW, VIDEOPRESS_FLOW } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useCreateSitePreviewLink } from 'calypso/components/site-preview-link/use-create-site-preview-link';
import {
	PreviewLink,
	useSitePreviewLinks,
} from 'calypso/components/site-preview-link/use-site-preview-links';
import WebPreview from 'calypso/components/web-preview/component';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
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
	const site = useSite();
	const translate = useTranslate();
	const { globalStylesInUse, shouldLimitGlobalStyles } = usePremiumGlobalStyles();

	const previewUrl = siteSlug ? 'https://' + siteSlug : null;
	const devicesToShow: Device[] = [ DEVICE_TYPES.COMPUTER, DEVICE_TYPES.PHONE ];
	let defaultDevice = flow === NEWSLETTER_FLOW ? DEVICE_TYPES.COMPUTER : DEVICE_TYPES.PHONE;
	const isVideoPressFlow = VIDEOPRESS_FLOW === flow;
	const isBusinessPlan = site?.plan?.product_slug
		? isWpComBusinessPlan( site?.plan?.product_slug )
		: false;
	const isEcommercePlan = site?.plan?.product_slug
		? isWpComEcommercePlan( site?.plan?.product_slug )
		: false;

	if ( isVideoPressFlow ) {
		const windowWidth = window.innerWidth;
		defaultDevice = windowWidth >= 1000 ? DEVICE_TYPES.COMPUTER : DEVICE_TYPES.PHONE;
	}

	const usePreviewSiteLinksQueryEnabled =
		site?.is_coming_soon && ( isBusinessPlan || isEcommercePlan ) && site?.is_wpcom_atomic;

	const { data: previewLinks, isLoading: isPreviewLinksLoading } = useSitePreviewLinks( {
		siteId: Number( site?.ID ),
		isEnabled: usePreviewSiteLinksQueryEnabled ?? false,
	} );

	const { createLink, isLoading: isCreatingSitePreviewLinks } = useCreateSitePreviewLink( {
		siteId: Number( site?.ID ),
	} );

	// Generate preview link for site on business or ecommerce plan
	// Preview links are only available on these two plans
	useEffect( () => {
		if ( previewLinks && Array.isArray( previewLinks ) && previewLinks.length === 0 ) {
			if ( isBusinessPlan || isEcommercePlan ) {
				createLink();
			}
		}
	}, [ previewLinks, createLink, isBusinessPlan, isEcommercePlan ] );

	const shareCode = getPreviewCode( previewLinks );

	function getPreviewCode( links: PreviewLink[] | undefined ) {
		if ( typeof links === 'undefined' ) {
			return false;
		}
		const link = links[ 0 ];
		return link?.code ?? false;
	}

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
