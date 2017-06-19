/**
 * External dependencies
 */
import { get } from 'lodash';

export function getData( state, siteId ) {
	return get( state, [ 'extensions', 'test', 'testExtension', siteId, 'data' ], {} );
}
