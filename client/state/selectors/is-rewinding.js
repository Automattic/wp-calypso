/**
 * External dependencies
 */
import { get, includes } from 'lodash';

/**
 * Is a site currently rewinding?
 *
 * @param {Object} state Global state tree
 * @param {number|string} siteId the site ID
 * @return {bool} true if site is rewinding, false if not
 */
export default function isRewinding( state, siteId ) {
	const rewind = get( state, [ 'rewind', siteId, 'rewind' ], false );

	if ( ! rewind ) {
		return false;
	}

	const status = get( rewind, [ 'status' ], 'unknown' );

	return includes( [ 'queued', 'running', 'unknown' ], status );
}
