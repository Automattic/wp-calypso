import { useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import WebPreview from 'calypso/components/web-preview';
import { addQueryArgs } from 'calypso/lib/route';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import { getSiteOption, isSitePreviewable } from 'calypso/state/sites/selectors';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import { closePreview } from 'calypso/state/ui/preview/actions';
import { getPreviewSiteId, getPreviewUrl } from 'calypso/state/ui/preview/selectors';

function SitePreviewInner( { siteId, className } ) {
	const dispatch = useDispatch();
	const [ previewCount, incrementPreviewCount ] = useReducer( ( n ) => n + 1, 0 );

	const showPreview = useSelector( ( state ) => getCurrentLayoutFocus( state ) === 'preview' );
	const selectedSiteNonce = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'frame_nonce' )
	);
	const previewUrl = useSelector( getPreviewUrl );
	const hideSEO = useSelector( ( state ) => isDomainOnlySite( state, siteId ) );

	function formatPreviewUrl() {
		if ( ! previewUrl ) {
			return null;
		}

		return addQueryArgs(
			{
				iframe: true,
				theme_preview: true,
				'frame-nonce': selectedSiteNonce ?? '',
				cachebust: previewCount,
			},
			previewUrl
		);
	}

	return (
		<WebPreview
			className={ className }
			externalUrl={ previewUrl }
			onClose={ () => {
				dispatch( closePreview() );
				incrementPreviewCount();
			} }
			previewUrl={ formatPreviewUrl() }
			showClose
			showExternal
			showPreview={ showPreview }
			showSEO={ ! hideSEO }
		/>
	);
}

export default function SitePreview( props ) {
	const siteId = useSelector( getPreviewSiteId );
	const isPreviewable = useSelector( ( state ) => isSitePreviewable( state, siteId ) );

	if ( ! isPreviewable ) {
		return null;
	}

	return <SitePreviewInner key={ siteId } siteId={ siteId } { ...props } />;
}
