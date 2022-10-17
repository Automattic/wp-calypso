import { NEWSLETTER_FLOW } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { DEVICE_TYPE } from 'calypso/../packages/design-picker/src/constants';
import { Device } from 'calypso/../packages/design-picker/src/types';
import WebPreview from 'calypso/components/web-preview/component';
import { useFlowParam } from 'calypso/landing/stepper/hooks/use-flow-param';
import PreviewToolbar from '../design-setup/preview-toolbar';

const LaunchpadSitePreview = ( { siteSlug }: { siteSlug: string | null } ) => {
	const translate = useTranslate();
	const previewUrl = siteSlug ? 'https://' + siteSlug : null;
	const flow = useFlowParam();
	const devicesToShow: Device[] = [ DEVICE_TYPE.COMPUTER, DEVICE_TYPE.PHONE ];
	const defaultDevice = flow === NEWSLETTER_FLOW ? DEVICE_TYPE.COMPUTER : DEVICE_TYPE.PHONE;

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
			do_preview_no_interactions: true,
		} );
	}

	return (
		<div className="launchpad__site-preview-wrapper">
			<WebPreview
				className="launchpad__-web-preview"
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
