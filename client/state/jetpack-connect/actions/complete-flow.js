/**
 * Internal dependencies
 */
import { clearPlan } from 'jetpack-connect/persistence-utils';
import { JETPACK_CONNECT_COMPLETE_FLOW } from 'state/jetpack-connect/action-types';

import 'state/jetpack-connect/init';

export function completeFlow( site ) {
	return ( dispatch ) => {
		clearPlan();
		dispatch( {
			type: JETPACK_CONNECT_COMPLETE_FLOW,
			site,
		} );
	};
}
