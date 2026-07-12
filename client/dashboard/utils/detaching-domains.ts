import { useSyncExternalStore } from 'react';

/**
 * Tracks domains the user has just requested to detach from a site.
 *
 * Detach is processed asynchronously on the backend ("in a few minutes"), so
 * reads keep reporting the domain as still attached and still pending-primary
 * for a while after the request succeeds. That leaves the "Setting up your
 * custom domain" notice on screen even though the user's intent to set it as
 * primary is void. We remember the intent client-side and suppress the notice
 * immediately, then drop the mark once fresh data confirms the domain is no
 * longer pending (see the reconciliation in the notice's call sites).
 */

let detaching: ReadonlySet< string > = new Set();
const listeners = new Set< () => void >();

function emit() {
	for ( const listener of listeners ) {
		listener();
	}
}

export function markDomainDetaching( domainName: string ) {
	if ( detaching.has( domainName ) ) {
		return;
	}
	detaching = new Set( detaching ).add( domainName );
	emit();
}

export function unmarkDomainDetaching( domainName: string ) {
	if ( ! detaching.has( domainName ) ) {
		return;
	}
	const next = new Set( detaching );
	next.delete( domainName );
	detaching = next;
	emit();
}

function subscribe( listener: () => void ) {
	listeners.add( listener );
	return () => {
		listeners.delete( listener );
	};
}

function getSnapshot() {
	return detaching;
}

export function useDetachingDomains(): ReadonlySet< string > {
	return useSyncExternalStore( subscribe, getSnapshot, getSnapshot );
}
