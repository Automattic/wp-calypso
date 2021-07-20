/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import {
	FULL_SITE_EDITING_THEMES_FAIL,
	FULL_SITE_EDITING_THEMES_FETCH,
	FULL_SITE_EDITING_THEMES_SUCCESS,
} from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

/**
 * Receives themes and dispatches them with full site editing themes success signal.
 *
 * @param {Array} themes array of received theme objects
 * @param {string} filter The active themes filter
 * @returns {Function} Action thunk
 */
export function receiveFullSiteEditingThemes( themes, filter ) {
	return ( dispatch ) => {
		dispatch( { type: FULL_SITE_EDITING_THEMES_SUCCESS, payload: themes, filter } );
	};
}

/**
 * Initiates network request for full site editing themes, based on `filter`.
 *
 * @param {string} filter A filter string for a theme query
 * @returns {Function} Action thunk
 */
export function getFullSiteEditingThemes( filter ) {
	return async ( dispatch ) => {
		dispatch( { type: FULL_SITE_EDITING_THEMES_FETCH, filter } );
		const query = {
			search: '',
			number: 50,
			tier: '',
			filter,
			apiVersion: '1.2',
		};
		try {
			const res = await wpcom.undocumented().themes( null, query );
			dispatch( receiveFullSiteEditingThemes( res, filter ) );
		} catch ( error ) {
			dispatch( { type: FULL_SITE_EDITING_THEMES_FAIL, filter } );
		}
	};
}
