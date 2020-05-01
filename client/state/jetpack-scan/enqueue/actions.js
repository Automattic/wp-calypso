/**
 * Internal dependencies
 */
import { JETPACK_SCAN_UPDATE, JETPACK_SCAN_ENQUEUE_REQUEST } from 'state/action-types';
import { requestScanStatus } from 'state/jetpack-scan/actions';

import 'state/data-layer/wpcom/sites/scan/enqueue';
import 'state/jetpack-scan/init';

export const requestJetpackScanEnqueue = ( siteId ) => ( {
	type: JETPACK_SCAN_ENQUEUE_REQUEST,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );

export const startScanOptimistically = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_SCAN_UPDATE,
			siteId,
			payload: { state: 'scanning' },
		} );

		setTimeout( () => dispatch( requestScanStatus( siteId ) ), 5 * 1000 );
	};
};
