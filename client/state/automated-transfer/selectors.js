/**
 * External dependencies
 */
import { get } from 'lodash';

export function getAutomatedTransferStatus( state, siteId ) {
	return get( state, [ 'automatedTransfer', 'status', siteId ], null );
}
