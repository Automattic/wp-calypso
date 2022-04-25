import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import WebPreview from 'calypso/components/web-preview';
import { addQueryArgs } from 'calypso/lib/route';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import { getSiteOption, getSiteSlug, isSitePreviewable } from 'calypso/state/sites/selectors';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import { closePreview } from 'calypso/state/ui/preview/actions';
import { getPreviewSiteId, getPreviewUrl } from 'calypso/state/ui/preview/selectors';

function usePreviewCounter( siteId, showPreview ) {
	const [ previewCount, setPreviewCount ] = useState( 0 );

	useEffect( () => {
		if ( siteId ) {
			setPreviewCount( 0 );
		}
	}, [ siteId ] );

	useEffect( () => {
		if ( showPreview ) {
			setPreviewCount( ( n ) => n + 1 );
		}
	}, [ showPreview ] );

	return previewCount;
}

function SitePreview( { className } ) {
	const dispatch = useDispatch();

	const selectedSiteId = useSelector( getPreviewSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, selectedSiteId ) );
	const selectedSiteUrl = `https://${ siteSlug }`.replace( /::/g, '/' );
	const showPreview = useSelector( ( state ) => getCurrentLayoutFocus( state ) === 'preview' );
	const selectedSiteNonce = useSelector( ( state ) =>
		getSiteOption( state, selectedSiteId, 'frame_nonce' )
	);
	const selectedSitePreviewable = useSelector( ( state ) =>
		isSitePreviewable( state, selectedSiteId )
	);
	const previewUrl = useSelector( getPreviewUrl );
	const hideSEO = useSelector( ( state ) => isDomainOnlySite( state, selectedSiteId ) );

	const previewCount = usePreviewCounter( selectedSiteId, showPreview );
	const basePreviewUrl = previewUrl || selectedSiteUrl;

	if ( ! selectedSitePreviewable ) {
		return null;
	}

	function formatPreviewUrl() {
		if ( ! selectedSiteUrl && ! previewUrl ) {
			return null;
		}

		return addQueryArgs(
			{
				iframe: true,
				theme_preview: true,
				'frame-nonce': selectedSiteNonce ?? '',
				cachebust: previewCount,
			},
			basePreviewUrl
		);
	}

	return (
		<WebPreview
			className={ className }
			previewUrl={ formatPreviewUrl() }
			externalUrl={ basePreviewUrl }
			showExternal={ true }
			showClose={ true }
			showPreview={ showPreview }
			onClose={ () => dispatch( closePreview() ) }
			showSEO={ ! hideSEO }
		/>
	);
}

export default SitePreview;
