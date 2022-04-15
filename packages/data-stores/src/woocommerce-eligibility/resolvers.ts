import { dispatch } from '@wordpress/data';
import { wpcomRequest } from '../wpcom-request-controls';
import { STORE_KEY } from './constants';
import { TransferEligibility, AtomicTransfer } from './types';

/**
 * Requests the site's transfer eligibility from the WPCOM API.
 *
 * @param   {string} type The type of products to request (e.g., "jetpack");
 */
export function* getAutomatedTransferEligibility( siteId: number ) {
	yield dispatch( STORE_KEY ).requestTransferEligibility();

	try {
		const transferEligibility: TransferEligibility = yield wpcomRequest( {
			path: `/sites/${ siteId }/automated-transfers/eligibility`,
			apiVersion: '1',
		} );

		yield dispatch( STORE_KEY ).receiveTransferEligibility( transferEligibility, siteId );
	} catch ( err ) {
		yield dispatch( STORE_KEY ).receiveTransferEligibilityFailure( err as any, siteId );
	}
}

export function* getLatestAtomicTransfer( siteId: number ) {
	if ( ! siteId ) {
		return null;
	}

	try {
		const transfer: AtomicTransfer = yield wpcomRequest( {
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ siteId }/atomic/transfers/latest`,
		} );

		yield dispatch( STORE_KEY ).receiveLatestAtomicTransfer( transfer, siteId );
	} catch ( err ) {
		yield dispatch( STORE_KEY ).receiveLatestAtomicTransferFailure( err as any, siteId );
	}
}
