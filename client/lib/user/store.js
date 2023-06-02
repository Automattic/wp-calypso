import store from 'store';
import { clearStorage } from 'calypso/lib/browser-storage';

/**
 * Empty localStorage cache to discard any user reference that the application may hold
 */
export async function clearStore() {
	store.clearAll();
	await clearStorage();
}

export function getStoredUserId() {
	return store.get( 'wpcom_user_id' );
}

export function setStoredUserId( userId ) {
	return store.set( 'wpcom_user_id', userId );
}

const disablePersistenceCallbacks = [];

export function disablePersistence() {
	for ( const callback of disablePersistenceCallbacks ) {
		callback();
	}
}

export function onDisablePersistence( callback ) {
	disablePersistenceCallbacks.push( callback );
}
