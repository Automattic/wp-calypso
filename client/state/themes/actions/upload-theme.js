import wpcom from 'calypso/lib/wp';
import {
	THEME_UPLOAD_FAILURE,
	THEME_UPLOAD_PROGRESS,
	THEME_UPLOAD_START,
	THEME_UPLOAD_SUCCESS,
} from 'calypso/state/themes/action-types';
import { receiveTheme } from 'calypso/state/themes/actions/receive-theme';

import 'calypso/state/themes/init';

const performThemeUpload = ( siteId, file, onProgress ) =>
	new Promise( ( resolve, reject ) => {
		const resolver = ( error, data ) => {
			error ? reject( error ) : resolve( data );
		};

		const req = wpcom.req.post(
			{
				path: '/sites/' + siteId + '/themes/new',
				formData: [ [ 'zip[]', file ] ],
			},
			resolver
		);

		req.upload.onprogress = onProgress;
	} );

/**
 * Triggers a theme upload to the given site.
 * @param {number} siteId -- Site to upload to
 * @param {window.File} file -- the theme zip to upload
 * @returns {Function} the action function
 */
export function uploadTheme( siteId, file ) {
	return ( dispatch ) => {
		dispatch( {
			type: THEME_UPLOAD_START,
			siteId,
		} );
		return performThemeUpload( siteId, file, ( event ) => {
			dispatch( {
				type: THEME_UPLOAD_PROGRESS,
				siteId,
				loaded: event.loaded,
				total: event.total,
			} );
		} )
			.then( ( theme ) => {
				dispatch( receiveTheme( theme, siteId ) );
				dispatch( {
					type: THEME_UPLOAD_SUCCESS,
					siteId,
					themeId: theme.id,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: THEME_UPLOAD_FAILURE,
					siteId,
					error,
				} );
			} );
	};
}
