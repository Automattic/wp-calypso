import { get } from 'lodash';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import 'calypso/state/jitm/init';

/**
 * Get the list of available jitms for the current site/section
 *
 * @param {Object} state The application state
 * @param {string} messagePath The jitm message path (ex: calypso:comments:admin_notices)
 * @returns {Array} An array of jitms
 */
export const getJITM = ( state, messagePath ) =>
	get( state, [ 'jitm', 'sitePathJITM', messagePath + getSelectedSiteId( state ) ], [] );

/**
 * Get the top jitm available for the current site/section
 *
 * @param {Object} state Thee application state
 * @param {string} messagePath The jitm message path (ex: calypso:comments:admin_notices)
 * @returns {Object} A jitm
 */
export const getTopJITM = ( state, messagePath ) => {
	const jitms = getJITM( state, messagePath );

	if ( jitms.length === 0 ) {
		return null;
	}

	return jitms[ 0 ];
};
