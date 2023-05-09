import store from 'store';
import { DISMISS_STORAGE_KEY } from './constants';

function getStorageKey( siteId: number | null = null ): string {
	return siteId ? `${ DISMISS_STORAGE_KEY }_${ siteId }` : DISMISS_STORAGE_KEY;
}

export function getDismissList( siteId: number | null = null ): string[] {
	const storageKey = getStorageKey( siteId );
	return store.get( storageKey ) || [];
}

export function setDismissList( list: string[], siteId: number | null = null ) {
	const storageKey = getStorageKey( siteId );
	store.set( storageKey, [ ...new Set( list ) ] );
}

export function addDismissId( id: string, siteId: number | null = null ) {
	const prev = getDismissList( siteId );
	setDismissList( [ ...prev, id ], siteId );
}
