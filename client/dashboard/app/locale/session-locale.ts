import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'wpcom-dashboard-session-locale';

/**
 * Session-local locale set by the omnibar language switcher. Changes the
 * dashboard's language for the current session without touching the account
 * setting. A module singleton so the omnibar and app (separate React trees,
 * one JS realm) share it.
 */
function readStoredLocale(): string | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	try {
		const stored = window.sessionStorage.getItem( STORAGE_KEY );
		window.sessionStorage.removeItem( STORAGE_KEY ); // Consumed by the reload that set it
		return stored;
	} catch {
		return null;
	}
}

function writeStoredLocale( locale: string | null ): void {
	if ( typeof window === 'undefined' ) {
		return;
	}

	try {
		if ( locale === null ) {
			window.sessionStorage.removeItem( STORAGE_KEY );
		} else {
			window.sessionStorage.setItem( STORAGE_KEY, locale );
		}
	} catch {
		// Ignore.
	}
}

let sessionLocale: string | null = readStoredLocale();
const listeners = new Set< () => void >();

export function getSessionLocale(): string | null {
	return sessionLocale;
}

export function setSessionLocale( locale: string | null ): void {
	if ( locale === sessionLocale ) {
		return;
	}
	sessionLocale = locale;
	writeStoredLocale( locale );
	listeners.forEach( ( listener ) => listener() );
}

function subscribe( listener: () => void ): () => void {
	listeners.add( listener );
	return () => {
		listeners.delete( listener );
	};
}

export function useSessionLocale(): string | null {
	return useSyncExternalStore( subscribe, getSessionLocale, getSessionLocale );
}
