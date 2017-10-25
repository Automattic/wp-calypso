/**
 * External dependencies
 *
 * @format
 */
import { get } from 'lodash';

/**
 * Returns the ID of the last restore request.
 *
 * @param {Object} state Global state tree.
 * @param {Number|String} siteId ID of the site to get the last restore ID for.
 * @return {Object} Object with the ID and time of last restore performed in this site, maybe still under progress.
 */
export default function getLastRestore( state, siteId ) {
	return get( state, [ 'activityLog', 'rewindStatus', siteId, 'lastRestore' ], {
		restore_id: 0,
		when: '',
	} );
}
