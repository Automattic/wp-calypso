import { useSyncExternalStore } from 'react';
import type { CrossoverDestinationId } from './destinations';

const DISMISSED_KEY = 'a4a-crossover-dismissed';

function getDismissed(): CrossoverDestinationId[] {
	try {
		return JSON.parse( localStorage.getItem( DISMISSED_KEY ) ?? '[]' );
	} catch {
		return [];
	}
}

export function isCrossoverDismissed( destination: CrossoverDestinationId ) {
	return getDismissed().includes( destination );
}

export function dismissCrossover( destination: CrossoverDestinationId ) {
	try {
		localStorage.setItem(
			DISMISSED_KEY,
			JSON.stringify( [ ...new Set( [ ...getDismissed(), destination ] ) ] )
		);
	} catch {}
}

export interface CrossoverRequest {
	destination: CrossoverDestinationId;
	url: string;
	onLeave?: () => void;
}

let current: CrossoverRequest | null = null;
const listeners = new Set< () => void >();

function setCurrent( next: CrossoverRequest | null ) {
	current = next;
	listeners.forEach( ( listener ) => listener() );
}

function subscribe( listener: () => void ) {
	listeners.add( listener );
	return () => {
		listeners.delete( listener );
	};
}

export function useCrossoverRequest() {
	return useSyncExternalStore( subscribe, () => current );
}

export function closeCrossover() {
	setCurrent( null );
}

export function openDestination( { url, onLeave }: CrossoverRequest ) {
	window.open( url, '_blank', 'noopener,noreferrer' );
	onLeave?.();
	setCurrent( null );
}

/**
 * Every place the dashboard sends an agency to another dashboard goes through
 * here: it shows the modal first, unless the agency asked not to see it again.
 */
export function leaveDashboard(
	destination: CrossoverDestinationId,
	url: string,
	onLeave?: () => void
) {
	if ( isCrossoverDismissed( destination ) ) {
		openDestination( { destination, url, onLeave } );
		return;
	}
	setCurrent( { destination, url, onLeave } );
}

/**
 * For links that would open the destination themselves: stops the browser's
 * own new tab and hands the click to `leaveDashboard`.
 */
export function onLeaveClick(
	destination: CrossoverDestinationId,
	url: string,
	onLeave?: () => void
) {
	return ( event: { preventDefault: () => void } ) => {
		event.preventDefault();
		leaveDashboard( destination, url, onLeave );
	};
}
