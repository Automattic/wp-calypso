import { useSyncExternalStore } from 'react';

/**
 * Session-local locale set by the omnibar language switcher. Changes the
 * dashboard's language for the current session without touching the account
 * setting. A module singleton so the omnibar and app (separate React trees,
 * one JS realm) share it; not persisted.
 */
let sessionLocale: string | null = null;
const listeners = new Set< () => void >();

export function getSessionLocale(): string | null {
	return sessionLocale;
}

export function setSessionLocale( locale: string | null ): void {
	if ( locale === sessionLocale ) {
		return;
	}
	sessionLocale = locale;
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
