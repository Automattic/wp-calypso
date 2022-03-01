import { Dispatch } from 'redux';
import wpcom from 'calypso/lib/wp';
import {
	TRENDING_THEMES_FAIL,
	TRENDING_THEMES_FETCH,
	TRENDING_THEMES_SUCCESS,
} from 'calypso/state/themes/action-types';
import { TrendingTheme } from 'calypso/types';

import 'calypso/state/themes/init';

/**
 * Receives themes and dispatches them with trending themes success signal.
 *
 * @param {Array} themes array of received theme objects
 * @returns {Function} Action thunk
 */
export function receiveTrendingThemes( themes: TrendingTheme[] ): ( dispatch: Dispatch ) => void {
	return ( dispatch ) => {
		dispatch( { type: TRENDING_THEMES_SUCCESS, payload: themes } );
	};
}

/**
 * Initiates network request for trending themes.
 */
export function getTrendingThemes(): ( dispatch: any ) => Promise< void > {
	return async ( dispatch ) => {
		dispatch( { type: TRENDING_THEMES_FETCH } );
		try {
			const res = await wpcom.req.get( '/themes', {
				sort: 'trending',
				number: 50,
				tier: '',
			} );
			dispatch( receiveTrendingThemes( res ) );
		} catch ( error ) {
			dispatch( { type: TRENDING_THEMES_FAIL } );
		}
	};
}
