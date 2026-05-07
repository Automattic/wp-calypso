import { useSyncExternalStore } from 'react';

let isActive = false;
const subscribers = new Set< () => void >();

export function getArcadeIsActive(): boolean {
	return isActive;
}

export function setArcadeIsActive( next: boolean ): void {
	if ( isActive === next ) {
		return;
	}
	isActive = next;
	subscribers.forEach( ( subscriber ) => subscriber() );
}

function subscribe( subscriber: () => void ): () => void {
	subscribers.add( subscriber );
	return () => {
		subscribers.delete( subscriber );
	};
}

export function useArcadeIsActive(): boolean {
	return useSyncExternalStore( subscribe, getArcadeIsActive, () => false );
}
