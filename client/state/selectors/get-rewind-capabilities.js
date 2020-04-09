/**
 * External Dependencies
 */
import { get } from 'lodash';

export default function getRewindCapabilities( state, siteId ) {
	return get( state, [ 'rewind', siteId, 'capabilities' ], [] );
}
