/**
 * External dependencies
 */
import { get } from 'lodash';

export function getAutomatedTransferStatus( state, siteId ) {
	return get( state, [ 'automatedTransfer', 'status', siteId ], null );
}

export const getEligibility = ( state, domain ) =>
	get( state, [ 'automatedTransfer', 'eligibility', domain ], { lastUpdate: 0 } );
