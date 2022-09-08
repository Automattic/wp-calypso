import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import WebPreview from 'calypso/components/web-preview/component';
import PreviewToolbar from 'calypso/signup/steps/design-picker/preview-toolbar';

const LaunchpadSitePreview = ( { siteSlug }: { siteSlug: string | null } ) => {
	const translate = useTranslate();
	const previewUrl = siteSlug
		? `https://public-api.wordpress.com/wpcom/v2/web-previews/site/${ siteSlug }`
		: null;
	const defaultDevice = 'phone';

	function formatPreviewUrl() {
		if ( ! previewUrl ) {
			return null;
		}

		return addQueryArgs( previewUrl, {
			iframe: true,
			// hide the "Create your website with WordPress.com" banner
			hide_banners: true,
		} );
	}

	return (
		<div className={ 'launchpad__site-preview-wrapper' }>
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
				devicesToShow={ [ 'computer', 'phone' ] }
				showSiteAddressBar={ false }
			/>
		</div>
	);
};

export default LaunchpadSitePreview;
