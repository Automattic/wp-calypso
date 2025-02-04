import wpcom from 'calypso/lib/wp';
import {
	RECOMMENDED_THEMES_FAIL,
	RECOMMENDED_THEMES_FETCH,
	RECOMMENDED_THEMES_SUCCESS,
} from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

/**
 * Receives themes and dispatches them with recommended themes success signal.
 * @param {Array} themes array of received theme objects
 * @param {string} filter The active themes filter
 * @returns {Function} Action thunk
 */
export function receiveRecommendedThemes( themes, filter ) {
	return ( dispatch ) => {
		dispatch( { type: RECOMMENDED_THEMES_SUCCESS, payload: themes, filter } );
	};
}

/**
 * Initiates network request for recommended themes, based on `filter`.
 * @param {string} filter A filter string for a theme query
 * @returns {Function} Action thunk
 */
export function getRecommendedThemes( filter ) {
	return async ( dispatch ) => {
		dispatch( { type: RECOMMENDED_THEMES_FETCH, filter } );
		const query = {
			search: '',
			number: 50,
			tier: '',
			filter,
			apiVersion: '1.2',
		};
		try {
			const res = await wpcom.req.get( '/themes', query );
			dispatch( receiveRecommendedThemes( res, filter ) );
		} catch ( error ) {
			dispatch( { type: RECOMMENDED_THEMES_FAIL, filter } );
		}
	};
}
