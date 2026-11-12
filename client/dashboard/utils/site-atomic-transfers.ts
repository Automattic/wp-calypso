import type { AtomicTransfer, AtomicTransferStatus, Site } from '@automattic/api-core';

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

/**
 * Whether the site is reported without its owner's capabilities and the user is that owner, which
 * happens while the site turns Atomic. Only then is it worth asking for the site's transfer.
 */
export function mayBeAwaitingAtomicTransfer( site: Site, userId?: number ) {
	return (
		!! userId &&
		site.site_owner === userId &&
		! site.is_deleted &&
		! site.capabilities?.manage_options
	);
}

/**
 * Whether the owner can't manage the site yet only because it is turning Atomic: the transfer is
 * still running, or it has finished and the owner's capabilities haven't reached the new site yet.
 */
export function isAwaitingAtomicTransfer(
	site: Site,
	userId: number | undefined,
	transfer: AtomicTransfer | null | undefined
) {
	if ( ! transfer || ! mayBeAwaitingAtomicTransfer( site, userId ) ) {
		return false;
	}
	return (
		isAtomicTransferInProgress( transfer.status ) ||
		( transfer.status === 'completed' && !! site.is_wpcom_atomic )
	);
}

/**
 * Thrown instead of `notFound()` when the owner can't manage their site yet only because it is
 * turning Atomic, so the site's error component can show that it is being set up.
 */
export class AtomicTransferInProgressError extends Error {
	constructor() {
		super( 'The site is turning Atomic.' );
		this.name = 'AtomicTransferInProgressError';
	}
}
