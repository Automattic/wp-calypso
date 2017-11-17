/**
 * External Dependencies
 */
import { get } from 'lodash';

export default function isSitePressable( state, siteId ) {
	return get( state.activityLog.rewindStatus, [ siteId, 'isPressable' ], null );
}
