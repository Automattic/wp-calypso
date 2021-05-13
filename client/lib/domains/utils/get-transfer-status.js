/**
 * Internal dependencies
 */
import { transferStatus } from 'calypso/lib/domains/constants';

export function getTransferStatus( domainFromApi ) {
	if ( domainFromApi.transfer_status === 'pending_owner' ) {
		return transferStatus.PENDING_OWNER;
	}

	if ( domainFromApi.transfer_status === 'pending_registry' ) {
		return transferStatus.PENDING_REGISTRY;
	}

	if ( domainFromApi.transfer_status === 'cancelled' ) {
		return transferStatus.CANCELLED;
	}

	if ( domainFromApi.transfer_status === 'completed' ) {
		return transferStatus.COMPLETED;
	}

	if ( domainFromApi.transfer_status === 'pending_start' ) {
		return transferStatus.PENDING_START;
	}

	return null;
}
