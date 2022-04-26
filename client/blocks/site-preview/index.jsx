import { createHigherOrderComponent } from '@wordpress/compose';
import { useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import WebPreview from 'calypso/components/web-preview';
import { addQueryArgs } from 'calypso/lib/route';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import { getSiteOption, isSitePreviewable } from 'calypso/state/sites/selectors';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import { closePreview } from 'calypso/state/ui/preview/actions';
import { getPreviewSiteId, getPreviewUrl } from 'calypso/state/ui/preview/selectors';

function SitePreview( { className } ) {
	const dispatch = useDispatch();
	const [ previewCount, incrementPreviewCount ] = useReducer( ( n ) => n + 1, 0 );

	const selectedSiteId = useSelector( getPreviewSiteId );
	const showPreview = useSelector( ( state ) => getCurrentLayoutFocus( state ) === 'preview' );
	const selectedSiteNonce = useSelector( ( state ) =>
		getSiteOption( state, selectedSiteId, 'frame_nonce' )
	);
	const selectedSitePreviewable = useSelector( ( state ) =>
		isSitePreviewable( state, selectedSiteId )
	);
	const previewUrl = useSelector( getPreviewUrl );
	const hideSEO = useSelector( ( state ) => isDomainOnlySite( state, selectedSiteId ) );

	if ( ! selectedSitePreviewable ) {
		return null;
	}

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
			previewUrl={ formatPreviewUrl() }
			externalUrl={ previewUrl }
			showExternal={ true }
			showClose={ true }
			showPreview={ showPreview }
			onClose={ () => {
				dispatch( closePreview() );
				incrementPreviewCount();
			} }
			showSEO={ ! hideSEO }
		/>
	);
}

const withSiteIdAsKey = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const selectedSiteId = useSelector( getPreviewSiteId );
		return <Wrapped key={ `site-preview-${ selectedSiteId }` } { ...props } />;
	},
	'WithSiteIdAsKey'
);

export default withSiteIdAsKey( SitePreview );
