/**
 * PROTOTYPE — proof of concept only.
 *
 * A tiny localStorage-backed store, so edits made in the prototype control
 * panel re-render the Overview immediately and survive a reload.
 */
import { useSyncExternalStore } from 'react';

const listeners = new Set< () => void >();

function subscribe( listener: () => void ) {
	listeners.add( listener );
	// Picks up changes made in other tabs, e.g. finishing /custom-signup.
	window.addEventListener( 'storage', listener );
	return () => {
		listeners.delete( listener );
		window.removeEventListener( 'storage', listener );
	};
}

function readRaw( key: string ) {
	try {
		return window.localStorage.getItem( key );
	} catch {
		// Storage can be unavailable (private mode, blocked site data).
		return null;
	}
}

export function writeStoredValue( key: string, value: unknown ) {
	try {
		if ( value === null ) {
			window.localStorage.removeItem( key );
		} else {
			window.localStorage.setItem( key, JSON.stringify( value ) );
		}
	} catch {
		// The demo keeps working without persistence.
	}
	listeners.forEach( ( listener ) => listener() );
}

export function readStoredObject( key: string ): Record< string, unknown > | null {
	const raw = readRaw( key );
	if ( ! raw ) {
		return null;
	}
	try {
		const parsed = JSON.parse( raw );
		return parsed && typeof parsed === 'object' ? parsed : null;
	} catch {
		return null;
	}
}

/**
 * Subscribes to one storage key and parses it. The parsed value is cached per
 * raw string so React gets a stable snapshot between renders.
 */
export function createStoredValueHook< T >( key: string, parse: ( raw: string | null ) => T ) {
	let cachedRaw: string | null | undefined;
	let cachedValue: T;

	const getSnapshot = () => {
		const raw = readRaw( key );
		if ( raw !== cachedRaw ) {
			cachedRaw = raw;
			cachedValue = parse( raw );
		}
		return cachedValue;
	};

	return function useStoredValue(): T {
		return useSyncExternalStore( subscribe, getSnapshot, getSnapshot );
	};
}
