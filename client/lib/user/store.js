/**
 * External dependencies
 */
import store from 'store';

/**
 * Internal dependencies
 */
import { clearStorage } from 'calypso/lib/browser-storage';

/**
 * Empty localStorage cache to discard any user reference that the application may hold
 */
export async function clearStore() {
	store.clearAll();
	await clearStorage();
}

export async function getUserId() {
	return await store.get( 'wpcom_user_id' );
}

export async function setUserId( userId ) {
	await store.set( 'wpcom_user_id', userId );
}
