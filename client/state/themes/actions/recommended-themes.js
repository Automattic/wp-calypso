/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	RECOMMENDED_THEMES_FAIL,
	RECOMMENDED_THEMES_FETCH,
	RECOMMENDED_THEMES_SUCCESS,
} from 'state/themes/action-types';

import 'state/themes/init';

/**
 * Receives themes and dispatches them with recommended themes success signal.
 *
 * @param {Array} themes array of received theme objects
 * @returns {Function} Action thunk
 */
export function receiveRecommendedThemes( themes ) {
	return ( dispatch ) => {
		dispatch( { type: RECOMMENDED_THEMES_SUCCESS, payload: themes } );
	};
}

/**
 * Initiates network request for recommended themes.
 * Recommended themes are template first themes and are denoted by the 'auto-loading-homepage' tag.
 *
 * @returns {Function} Action thunk
 */
export function getRecommendedThemes() {
	return async ( dispatch ) => {
		dispatch( { type: RECOMMENDED_THEMES_FETCH } );
		const query = {
			search: '',
			number: 50,
			tier: '',
			filter: 'auto-loading-homepage',
			apiVersion: '1.2',
		};
		try {
			const res = await wpcom.undocumented().themes( null, query );
			dispatch( receiveRecommendedThemes( res ) );
		} catch ( error ) {
			dispatch( { type: RECOMMENDED_THEMES_FAIL } );
		}
	};
}
