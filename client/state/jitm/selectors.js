/**
 * External dependencies
 */
import { get } from 'lodash';

/** Internal dependencies */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Get the list of available jitms for the current site/section
 *
 * @param {object} state The application state
 * @param {string} messagePath The jitm message path (ex: calypso:comments:admin_notices)
 * @returns {Array} An array of jitms
 */
export const getJITM = ( state, messagePath ) =>
	get( state, [ 'jitm', 'sitePathJITM', messagePath + getSelectedSiteId( state ) ], null );

/**
 * Get the top jitm available for the current site/section
 *
 * @param {object} state Thee application state
 * @param {string} messagePath The jitm message path (ex: calypso:comments:admin_notices)
 * @returns {object} A jitm
 */

let JITMCache = [];

export const getTopJITM = ( state, messagePath ) => {
	const jitms = getJITM( state, messagePath );

	// If we have yet to populate the JITM state for the
	// given message path then return from the previous JITM
	// cache until JITMS can be fulfilled from network.
	if ( jitms === null ) {
		return JITMCache[ 0 ] || null;
	}

	// If having fullfilled we still have no JITMs then
	// clear the cache and return null to signify empty.
	if ( ! jitms.length ) {
		JITMCache = [];
		return null;
	}

	// Cache the results.
	JITMCache = Array.from( jitms );

	// Return results.
	return jitms[ 0 ];
};

export const hasJITM = ( state, messagePath ) => {
	return !! getTopJITM( state, messagePath );
};
