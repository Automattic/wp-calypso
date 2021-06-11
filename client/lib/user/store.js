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
