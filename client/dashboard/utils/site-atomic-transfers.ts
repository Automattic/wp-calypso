import type { AtomicTransferStatus } from 'calypso/data/types';

export function isAtomicTransferInProgress( status: AtomicTransferStatus ) {
	const inProgressStatuses: AtomicTransferStatus[] = [
		'pending',
		'active',
		'provisioned',
		'relocating_switcheroo',
	];
	return inProgressStatuses.includes( status );
}
