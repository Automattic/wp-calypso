/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	THEME_UPLOAD_FAILURE,
	THEME_UPLOAD_PROGRESS,
	THEME_UPLOAD_START,
	THEME_UPLOAD_SUCCESS,
} from 'state/themes/action-types';
import { receiveTheme } from 'state/themes/actions/receive-theme';

import 'state/themes/init';

/**
 * Triggers a theme upload to the given site.
 *
 * @param {number} siteId -- Site to upload to
 * @param {window.File} file -- the theme zip to upload
 *
 * @returns {Function} the action function
 */
export function uploadTheme( siteId, file ) {
	return ( dispatch ) => {
		dispatch( {
			type: THEME_UPLOAD_START,
			siteId,
		} );
		return wpcom
			.undocumented()
			.uploadTheme( siteId, file, ( event ) => {
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
