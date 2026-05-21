import page from '@automattic/calypso-router';
import { useSyncExternalStore } from '@wordpress/element';
import { DESCRIBE_ROUTE_PREFIX } from './constants';
import type { Pick } from './agent-provider';

const EMPTY: Pick[] = [];

let currentPicks: Pick[] = EMPTY;
let isLookingState = false;
const listeners = new Set< () => void >();

function notify(): void {
	for ( const listener of listeners ) {
		listener();
	}
}

export function setPicks( next: Pick[] ): void {
	currentPicks = next.length === 0 ? EMPTY : next;
	isLookingState = false;
	notify();
}

export function deliverPicks( picks: Pick[], siteSlug: string | null | undefined ): void {
	setPicks( picks );

	if ( picks.length === 0 || ! siteSlug ) {
		return;
	}

	if ( window.location.pathname.startsWith( DESCRIBE_ROUTE_PREFIX ) ) {
		return;
	}

	// Navigate the user to the route showing the picks.
	page( `${ DESCRIBE_ROUTE_PREFIX }/${ siteSlug }` );
}

export function setLooking( looking: boolean ): void {
	if ( isLookingState === looking ) {
		return;
	}

	isLookingState = looking;
	notify();
}

function getPicks(): Pick[] {
	return currentPicks;
}

function isLooking(): boolean {
	return isLookingState;
}

function subscribe( listener: () => void ): () => void {
	listeners.add( listener );

	return () => {
		listeners.delete( listener );
	};
}

export function usePicks(): [ Pick[], typeof setPicks ] {
	const picks = useSyncExternalStore( subscribe, getPicks, getPicks );
	return [ picks, setPicks ];
}

export function useIsLooking(): [ boolean, typeof setLooking ] {
	const looking = useSyncExternalStore( subscribe, isLooking, isLooking );
	return [ looking, setLooking ];
}
