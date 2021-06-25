/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/media/init';

/**
 * Get the next page handle for the sites current media request
 *
 * @param {object} state The state object
 * @param {number} siteId The site ID
 */
export default function getNextPageHandle( state, siteId ) {
	return get( state.media.fetching, [ siteId, 'nextPageHandle' ] );
}
