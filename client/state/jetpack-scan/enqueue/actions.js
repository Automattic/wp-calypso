/**
 * Internal dependencies
 */
import { JETPACK_SCAN_UPDATE, JETPACK_SCAN_ENQUEUE_REQUEST } from 'calypso/state/action-types';
import { requestScanStatus } from 'calypso/state/jetpack-scan/actions';

import 'calypso/state/data-layer/wpcom/sites/scan/enqueue';
import 'calypso/state/jetpack-scan/init';

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
