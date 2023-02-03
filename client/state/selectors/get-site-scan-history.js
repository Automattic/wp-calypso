import { get } from 'lodash';

import 'calypso/state/data-layer/wpcom/sites/scan';

/**
 * Returns an array found threats in the current scan process of Jetpack Scan.
 * Returns an empty array if the site is unknown, or there is no information yet.
 *
 * @param  {Object}   state    Global state tree
 * @param  {number}   siteId   The ID of the site we're querying
 * @returns {import('calypso/components/jetpack/threat-item/types').Threat[]} Array of threats found
 */
export default function getSiteScanHistory( state, siteId ) {
	return get( state, [ 'jetpackScan', 'history', 'data', siteId, 'threats' ], [] );
}
