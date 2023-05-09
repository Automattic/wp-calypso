import { get } from 'lodash';

import 'calypso/state/wordads/init';

export function isSiteWordadsUnsafe( state, siteId ) {
	return get( state, [ 'wordads', 'status', siteId, 'unsafe' ], false );
}
