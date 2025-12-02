import type { AtomicTransferStatus, Site } from '@automattic/api-core';

export function isAtomicTransferInProgress( status: AtomicTransferStatus ) {
	const inProgressStatuses: AtomicTransferStatus[] = [
		'pending',
		'active',
		'provisioned',
		'relocating_switcheroo',
	];
	return inProgressStatuses.includes( status );
}

export const isAtomicTransferredSite = ( site: Partial< Site > ) =>
	// The capabilities are not immediately propagated to the atomic site
	site.is_wpcom_atomic && site.capabilities?.manage_options;
