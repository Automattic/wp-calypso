/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import {
	BLOCK_THEMES_FAIL,
	BLOCK_THEMES_FETCH,
	BLOCK_THEMES_SUCCESS,
} from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

/**
 * Receives themes and dispatches them with a block themes success signal.
 *
 * @param {Array} themes array of received theme objects
 * @returns {Function} Action thunk
 */
export function receiveBlockThemes( themes ) {
	return ( dispatch ) => {
		dispatch( { type: BLOCK_THEMES_SUCCESS, payload: themes } );
	};
}

/**
 * Initiates a network request for block themes.
 * Block themes are for the Site Editor and are denoted by the 'block-templates' tag.
 *
 * @returns {Function} Action thunk
 */
export function getBlockThemes() {
	return async ( dispatch ) => {
		dispatch( { type: BLOCK_THEMES_FETCH } );
		const query = {
			search: '',
			number: 50,
			tier: '',
			filter: 'block-templates',
			apiVersion: '1.2',
		};
		try {
			const res = await wpcom.undocumented().themes( null, query );
			dispatch( receiveBlockThemes( res ) );
		} catch ( error ) {
			dispatch( { type: BLOCK_THEMES_FAIL } );
		}
	};
}
