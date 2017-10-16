/**
 * External dependencies
 */
import { get } from 'lodash';

/** Internal dependencies */
import { getSectionName, getSelectedSiteId } from 'state/ui/selectors';

/**
 * Get the list of available jitms for the current site/section
 * @param {object} state The application state
 * @return {array} An array of jitms
 */
export const getJITM = ( state ) => get( state, [ 'jitm', 'sitePathJITM', getSectionName( state ) + getSelectedSiteId( state ) ], [] );

/**
 * Get the top jitm available for the current site/section
 * @param {object} state Thee application state
 * @return {object} A jitm
 */
export const getTopJITM = ( state ) => {
	const jitms = getJITM( state );

	if ( jitms.length === 0 ) {
		return null;
	}

	return jitms[ 0 ];
};
