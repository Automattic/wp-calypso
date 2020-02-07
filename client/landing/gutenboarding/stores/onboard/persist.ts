/*
    Defines the options used for the @wp/data persistence plugin, 
    which include a persistent storage implementation to add data expiration handling.
*/

const PERSISTENCE_INTERVAL = 7 * 24 * 3600000; // days * hours in days * ms in hour
const STORAGE_KEY = 'WP_ONBOARD';
const STORAGE_TS_KEY = 'WP_ONBOARD_TS';

// A plain object fallback if localStorage is not available
const objStore: { [ key: string ]: string } = {};

const objStorage: Pick< Storage, 'getItem' | 'setItem' | 'removeItem' > = {
	getItem( key ) {
		if ( objStore.hasOwnProperty( key ) ) {
			return objStore[ key ];
		}

		return null;
	},
	setItem( key, value ) {
		objStore[ key ] = String( value );
	},
	removeItem( key ) {
		delete objStore[ key ];
	},
};

// Make sure localStorage support exists
const localStorageSupport = (): boolean => {
	try {
		window.localStorage.setItem( 'WP_ONBOARD_TEST', '1' );
		window.localStorage.removeItem( 'WP_ONBOARD_TEST' );
		return true;
	} catch ( e ) {
		return false;
	}
};

// Choose the right storage implementation
const storageHandler = localStorageSupport() ? window.localStorage : objStorage;

// Persisted data expires after seven days
const isFresh = ( timestampStr: string ): boolean => {
	const timestamp = Number( timestampStr );
	return Boolean( timestamp ) && timestamp + PERSISTENCE_INTERVAL > Date.now();
};

// Check for "fresh" query param
const hasFreshParam = (): boolean => {
	return window.location.search.indexOf( 'fresh' ) !== -1;
};

// Handle data expiration by providing a storage object override to the @wp/data persistence plugin.
const storage: Pick< Storage, 'getItem' | 'setItem' > = {
	getItem( key ) {
		const timestamp = storageHandler.getItem( STORAGE_TS_KEY );

		if ( timestamp && isFresh( timestamp ) && ! hasFreshParam() ) {
			return storageHandler.getItem( key );
		}

		storageHandler.removeItem( STORAGE_KEY );
		storageHandler.removeItem( STORAGE_TS_KEY );

		return null;
	},
	setItem( key, value ) {
		storageHandler.setItem( STORAGE_TS_KEY, JSON.stringify( Date.now() ) );
		storageHandler.setItem( key, value );
	},
};

const persistOptions = {
	storageKey: STORAGE_KEY,
	storage,
};

export default persistOptions;
