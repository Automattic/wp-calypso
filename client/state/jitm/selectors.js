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
export const getTopJITM = ( state, messagePath ) => {
	const jitms = getJITM( state, messagePath );

	// If JITMs haven't been populated from network for given messagePath + siteId
	// then fallback to the most recent JITM for the given siteId.
	if ( null === jitms ) {
		return state?.jitm?.sitePathJITMCache[ getSelectedSiteId( state ) ] || null;
	}

	// If JITMs have been populated for the given messagePath + siteId and they are
	// genuinely empty (ie: no messages) then legitimately return null to signify this.
	if ( ! jitms.length ) {
		return null;
	}

	// Otherwise default to returning the top JITM
	return jitms[ 0 ];
};
