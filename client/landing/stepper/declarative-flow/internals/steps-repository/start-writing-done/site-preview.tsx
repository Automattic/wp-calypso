import { DEVICE_TYPES } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import WebPreview from 'calypso/components/web-preview/component';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSitePreviewShareCode } from 'calypso/landing/stepper/hooks/use-site-preview-share-code';
import { usePremiumGlobalStyles } from 'calypso/state/sites/hooks/use-premium-global-styles';
import PreviewToolbar from '../design-setup/preview-toolbar';
import type { Device } from '@automattic/components';

const StartWritingDoneSitePreview = ( { siteSlug }: { siteSlug: string | null } ) => {
	const translate = useTranslate();
	const site = useSite();
	const { globalStylesInUse } = usePremiumGlobalStyles( site?.ID );

	const previewUrl = siteSlug ? 'https://' + siteSlug : null;
	const devicesToShow: Device[] = [ DEVICE_TYPES.COMPUTER, DEVICE_TYPES.PHONE ];
	const loadingMessage = translate( '{{strong}}One moment, please…{{/strong}} loading your site.', {
		components: { strong: <strong /> },
	} );

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
			do_preview_no_interactions: false,
			...( globalStylesInUse && { 'preview-global-styles': true } ),
		} );
	}

	return (
		<div className="launchpad__site-preview-wrapper">
			<WebPreview
				className="launchpad__-web-preview"
				disableTabbing
				showDeviceSwitcher={ false }
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
				defaultViewportDevice={ DEVICE_TYPES.COMPUTER }
				devicesToShow={ devicesToShow }
				showSiteAddressBar={ false }
			/>
		</div>
	);
};

export default StartWritingDoneSitePreview;
