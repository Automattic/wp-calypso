import { DEVICE_TYPES } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import WebPreview from 'calypso/components/web-preview/component';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSitePreviewShareCode } from 'calypso/landing/stepper/hooks/use-site-preview-share-code';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import PreviewToolbar from './preview-toolbar';
import type { Device } from '@automattic/components';
import './style.scss';

interface Props {
	siteSlug: string | null;
	defaultDevice?: Device;
	showDeviceSwitcher?: boolean;
}

const SitePreview = ( {
	siteSlug = '',
	defaultDevice = DEVICE_TYPES.COMPUTER,
	showDeviceSwitcher = false,
}: Props ) => {
	const translate = useTranslate();
	const site = useSite();
	const { globalStylesInUse } = useSiteGlobalStylesStatus( site?.ID );
	const devicesToShow: Device[] = [
		DEVICE_TYPES.COMPUTER,
		DEVICE_TYPES.TABLET,
		DEVICE_TYPES.PHONE,
	];

	const previewUrl = siteSlug ? `https://${ siteSlug }` : null;
	const loadingMessage = translate( '{{strong}}One moment, please…{{/strong}} loading your site.', {
		components: { strong: <strong /> },
	} );

	const { shareCode, isPreviewLinksLoading, isCreatingSitePreviewLinks } =
		useSitePreviewShareCode();

	const formatPreviewUrl = () => {
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
			do_preview_no_interactions: true,
			...( globalStylesInUse && { 'preview-global-styles': true } ),
		} );
	};

	return (
		<div className="site-preview__wrapper">
			<WebPreview
				className="site-preview__web-preview"
				disableTabbing
				showDeviceSwitcher={ showDeviceSwitcher }
				showPreview
				showSEO
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
				disableTimeoutRedirect
			/>
		</div>
	);
};

export default SitePreview;
