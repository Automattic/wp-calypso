import { queryClient, rawUserPreferencesQuery } from '@automattic/api-queries';
import { useSyncExternalStore } from 'react';
import type { CrossoverDestinationId } from './destinations';
import type { UserPreferences } from '@automattic/api-core';
import type { MouseEvent } from 'react';

export const CROSSOVER_DISMISSED_PREFERENCE = 'a4a-crossover-dismissed';

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

// Read from the cache so a dismissed destination opens within the click, where the browser
// still allows a new tab. `CrossoverModalHost` keeps the preferences loaded.
function isDismissed( destination: CrossoverDestinationId ) {
	const preferences = queryClient.getQueryData< UserPreferences >(
		rawUserPreferencesQuery().queryKey
	);
	return !! preferences?.[ CROSSOVER_DISMISSED_PREFERENCE ]?.includes( destination );
}

/**
 * Sends the agency to another dashboard in a new tab, after the crossover modal unless they
 * asked not to see it again for this destination.
 */
export function leaveDashboard(
	destination: CrossoverDestinationId,
	url: string,
	onLeave?: () => void
) {
	const request = { destination, url, onLeave };
	// No host outside the agency layout (the 404 and error pages keep the sidebar).
	if ( ! listeners.size || isDismissed( destination ) ) {
		openDestination( request );
		return;
	}
	setCurrent( request );
}

/**
 * For links that open the destination themselves: the click goes to `leaveDashboard` instead.
 * A modifier click already asks the browser for a background tab or window, so it goes through.
 */
export function onLeaveClick(
	destination: CrossoverDestinationId,
	url: string,
	onLeave?: () => void
) {
	return ( event: MouseEvent ) => {
		if ( event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
			onLeave?.();
			return;
		}
		event.preventDefault();
		leaveDashboard( destination, url, onLeave );
	};
}
