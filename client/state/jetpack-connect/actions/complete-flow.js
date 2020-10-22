/**
 * Internal dependencies
 */
import { clearPlan } from 'calypso/jetpack-connect/persistence-utils';
import { JETPACK_CONNECT_COMPLETE_FLOW } from 'calypso/state/jetpack-connect/action-types';

import 'calypso/state/jetpack-connect/init';

export function completeFlow( site ) {
	return ( dispatch ) => {
		clearPlan();
		dispatch( {
			type: JETPACK_CONNECT_COMPLETE_FLOW,
			site,
		} );
	};
}
