/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import {
	RECOMMENDED_THEMES_FAIL,
	RECOMMENDED_THEMES_FETCH,
	RECOMMENDED_THEMES_SUCCESS,
} from 'calypso/state/themes/action-types';
import { getRecommendedThemesFilter } from 'calypso/state/themes/utils';

import 'calypso/state/themes/init';

/**
 * Receives themes and dispatches them with recommended themes success signal.
 *
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
 * Initiates network request for recommended themes.
 * Recommended themes default to template first themes, denoted by the 'auto-loading-homepage' tag.
 * If Block Themes are preferred, they will use the 'block-templates' tag
 *
 * @param {boolean} blockThemes Whether or not to filter on block themes
 * @returns {Function} Action thunk
 */
export function getRecommendedThemes( blockThemes = false ) {
	const filter = getRecommendedThemesFilter( blockThemes );
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
			const res = await wpcom.undocumented().themes( null, query );
			dispatch( receiveRecommendedThemes( res, filter ) );
		} catch ( error ) {
			dispatch( { type: RECOMMENDED_THEMES_FAIL, filter } );
		}
	};
}
