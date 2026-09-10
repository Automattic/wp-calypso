import { useMemo, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'a4a-provisioning-sites';
const CHANGE_EVENT = 'a4a-provisioning-sites-change';

// A site that has not reported itself ready by then is no longer worth a
// banner: the tab has likely been open since long before the user cared.
const PROVISIONING_TTL_MS = 5 * 60 * 1000;

type ProvisioningSite = {
	id: number;
	expiresAt: number;
};

function canUseLocalStorage(): boolean {
	return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function read(): string {
	if ( ! canUseLocalStorage() ) {
		return '';
	}

	try {
		return window.localStorage.getItem( STORAGE_KEY ) ?? '';
	} catch {
		return '';
	}
}

function write( sites: ProvisioningSite[] ): void {
	if ( canUseLocalStorage() ) {
		try {
			window.localStorage.setItem( STORAGE_KEY, JSON.stringify( sites ) );
		} catch {
			// Ignore — quota exceeded or storage disabled. The banner is a
			// courtesy; provisioning carries on without it.
		}
	}

	window.dispatchEvent( new CustomEvent( CHANGE_EVENT ) );
}

function parse( stored: string ): ProvisioningSite[] {
	if ( ! stored ) {
		return [];
	}

	try {
		const sites = JSON.parse( stored );
		return Array.isArray( sites ) ? sites : [];
	} catch {
		return [];
	}
}

function subscribe( onChange: () => void ) {
	window.addEventListener( CHANGE_EVENT, onChange );
	// Another tab starting a site counts too.
	window.addEventListener( 'storage', onChange );

	return () => {
		window.removeEventListener( CHANGE_EVENT, onChange );
		window.removeEventListener( 'storage', onChange );
	};
}

/**
 * Remembers the sites whose creation this browser started, so the sites page
 * can report on them after the redirect that follows provisioning.
 */
export function trackProvisioningSite( siteId: number ): void {
	const sites = parse( read() ).filter( ( { id } ) => id !== siteId );
	write( [ ...sites, { id: siteId, expiresAt: Date.now() + PROVISIONING_TTL_MS } ] );
}

export function untrackProvisioningSite( siteId: number ): void {
	write( parse( read() ).filter( ( { id } ) => id !== siteId ) );
}

function toLiveIds( stored: string ): number[] {
	return parse( stored )
		.filter( ( { expiresAt } ) => expiresAt > Date.now() )
		.map( ( { id } ) => id );
}

export function getProvisioningSiteIds(): number[] {
	return toLiveIds( read() );
}

export function useProvisioningSiteIds(): number[] {
	const stored = useSyncExternalStore( subscribe, read, () => '' );

	return useMemo( () => toLiveIds( stored ), [ stored ] );
}
