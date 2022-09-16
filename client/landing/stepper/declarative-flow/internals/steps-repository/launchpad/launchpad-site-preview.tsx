import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { Device } from 'calypso/../packages/design-picker/src/types';
import WebPreview from 'calypso/components/web-preview/component';
import wp from 'calypso/lib/wp';
import PreviewToolbar from '../design-setup/preview-toolbar';

const LaunchpadSitePreview = ( { siteSlug }: { siteSlug: string | null } ) => {
	const translate = useTranslate();
	const defaultDevice = 'phone';
	const devicesToShow: Device[] = [ 'computer', 'phone' ];

	const [ previewContent, setPreviewContent ] = useState( '' );
	const [ webPreviewLoadingStatus, setWebPreviewLoadingStatus ] = useState(
		translate( '{{strong}}One moment, please…{{/strong}} loading your site.', {
			components: { strong: <strong /> },
		} )
	);

	useEffect( () => {
		if ( siteSlug ) {
			const previewUrl = siteSlug ? `/sites/${ siteSlug }/web-previews?hide_banners=true` : null;
			const errorWebPreviewMessage = translate(
				'{{strong}}Error{{/strong}} There was an issue loading the site preview.',
				{
					components: { strong: <strong /> },
				}
			);
			wp.req
				.get( { path: previewUrl, apiNamespace: 'wpcom/v2' } )
				.then( ( response: string ) => setPreviewContent( response ) )
				.catch( () => setWebPreviewLoadingStatus( errorWebPreviewMessage ) );
		}
	}, [ siteSlug, translate ] );

	return (
		<div className={ 'launchpad__site-preview-wrapper' }>
			<WebPreview
				className="launchpad__-web-preview"
				showDeviceSwitcher={ true }
				showPreview
				showSEO={ true }
				isContentOnly
				externalUrl={ siteSlug }
				previewMarkup={ previewContent }
				toolbarComponent={ PreviewToolbar }
				showClose={ false }
				showEdit={ false }
				showExternal={ false }
				loadingMessage={ webPreviewLoadingStatus }
				translate={ translate }
				defaultViewportDevice={ defaultDevice }
				devicesToShow={ devicesToShow }
				showSiteAddressBar={ false }
			/>
		</div>
	);
};

export default LaunchpadSitePreview;
