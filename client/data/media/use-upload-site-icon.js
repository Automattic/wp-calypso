import { createHigherOrderComponent } from '@wordpress/compose';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { createTransientMediaId } from 'calypso/lib/media/utils';
import { saveSiteSettings, updateSiteSettings } from 'calypso/state/site-settings/actions';
import { useAddMedia } from './use-add-media';

const updateSiteIcon = ( siteId, mediaId ) => updateSiteSettings( siteId, { site_icon: mediaId } );

export const useUploadSiteIcon = () => {
	const dispatch = useDispatch();
	const addMedia = useAddMedia();
	const uploadSiteIcon = useCallback(
		async ( blob, fileName, siteId, originalSiteIconId, site ) => {
			const transientMediaId = createTransientMediaId( 'site-icon' );

			const file = {
				ID: transientMediaId,
				fileContents: blob,
				fileName,
			};

			dispatch( updateSiteIcon( siteId, transientMediaId ) );

			try {
				const [ { ID: savedId } ] = await addMedia( file, site );
				dispatch( saveSiteSettings( siteId, { site_icon: savedId } ) );
			} catch ( error ) {
				if ( originalSiteIconId ) {
					dispatch( updateSiteIcon( siteId, originalSiteIconId ) );
				}
				throw error;
			}
		},
		[ dispatch, addMedia ]
	);

	return uploadSiteIcon;
};

export const withUploadSiteIcon = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const uploadSiteIcon = useUploadSiteIcon();
		return <Wrapped { ...props } uploadSiteIcon={ uploadSiteIcon } />;
	},
	'withUploadSiteIcon'
);
