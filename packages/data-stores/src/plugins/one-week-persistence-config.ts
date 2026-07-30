/*
    Defines the options used for the @wp/data persistence plugin, 
    which include a persistent storage implementation to add data expiration handling.
*/
const storageKey = 'WPCOM_7_DAYS_PERSISTENCE';
const PERSISTENCE_INTERVAL = 7 * 24 * 3600000; // days * hours in days * ms in hour
const STORAGE_KEY = storageKey;
const STORAGE_TS_KEY = storageKey + '_TS';
const HANDOFF_STORAGE_KEY = storageKey + '_LOGGED_OUT_ODIE_CHAT_HANDOFF';
const HELP_CENTER_STORE_KEY = 'automattic/help-center';
const LOGGED_OUT_ODIE_CHAT_PERSISTENCE_KEYS = [
	// Keep the singular field for backwards compatibility with independently deployed clients.
	'loggedOutOdieChat',
	'loggedOutOdieChats',
	'loggedOutOdieChatHandoffs',
];

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

const getSessionStorage = (): Storage | undefined => {
	try {
		return window.sessionStorage;
	} catch {
		return undefined;
	}
};

// Persisted data expires after seven days
const isNotExpired = ( timestampStr: string ): boolean => {
	const timestamp = Number( timestampStr );
	return Boolean( timestamp ) && timestamp + PERSISTENCE_INTERVAL > Date.now();
};

// Check for "fresh" query param
const hasFreshParam = (): boolean => {
	return new URLSearchParams( window.location.search ).has( 'fresh' );
};

const parsePersistedState = ( value: string | null ): Record< string, unknown > => {
	if ( ! value ) {
		return {};
	}

	try {
		const state: unknown = JSON.parse( value );
		return typeof state === 'object' && state !== null
			? ( state as Record< string, unknown > )
			: {};
	} catch {
		return {};
	}
};

const getLoggedOutOdieChatHandoffState = (
	value: string
): Record< string, Record< string, unknown > > | undefined => {
	const persistedState = parsePersistedState( value );
	const helpCenterState = persistedState[ HELP_CENTER_STORE_KEY ];

	if ( typeof helpCenterState !== 'object' || helpCenterState === null ) {
		return undefined;
	}

	const handoffs = ( helpCenterState as Record< string, unknown > ).loggedOutOdieChatHandoffs;
	if ( typeof handoffs !== 'object' || handoffs === null || ! Object.keys( handoffs ).length ) {
		return undefined;
	}

	const persistedHelpCenterState = Object.fromEntries(
		LOGGED_OUT_ODIE_CHAT_PERSISTENCE_KEYS.filter( ( key ) =>
			Object.prototype.hasOwnProperty.call( helpCenterState, key )
		).map( ( key ) => [ key, ( helpCenterState as Record< string, unknown > )[ key ] ] )
	);

	return {
		[ HELP_CENTER_STORE_KEY ]: persistedHelpCenterState,
	};
};

export const getLoggedOutOdieChatHandoff = (): string | null => {
	const sessionStorage = getSessionStorage();
	const persistedHandoff = parsePersistedState(
		sessionStorage?.getItem( HANDOFF_STORAGE_KEY ) ?? null
	);
	const timestamp = persistedHandoff.timestamp;

	if (
		typeof timestamp !== 'number' ||
		! isNotExpired( String( timestamp ) ) ||
		typeof persistedHandoff.state !== 'object' ||
		persistedHandoff.state === null
	) {
		sessionStorage?.removeItem( HANDOFF_STORAGE_KEY );
		return null;
	}

	return JSON.stringify( persistedHandoff.state );
};

const mergeLoggedOutOdieChatHandoff = ( persisted: string | null, handoff: string ): string => {
	const persistedState = parsePersistedState( persisted );
	const handoffState = parsePersistedState( handoff );
	const persistedHelpCenterState = persistedState[ HELP_CENTER_STORE_KEY ];
	const handoffHelpCenterState = handoffState[ HELP_CENTER_STORE_KEY ];

	return JSON.stringify( {
		...persistedState,
		...handoffState,
		[ HELP_CENTER_STORE_KEY ]: {
			...( typeof persistedHelpCenterState === 'object' && persistedHelpCenterState !== null
				? persistedHelpCenterState
				: {} ),
			...( typeof handoffHelpCenterState === 'object' && handoffHelpCenterState !== null
				? handoffHelpCenterState
				: {} ),
		},
	} );
};

const setLoggedOutOdieChatHandoff = ( value: string, timestamp: number ): void => {
	const sessionStorage = getSessionStorage();
	const state = getLoggedOutOdieChatHandoffState( value );

	if ( state ) {
		sessionStorage?.setItem( HANDOFF_STORAGE_KEY, JSON.stringify( { state, timestamp } ) );
	} else {
		sessionStorage?.removeItem( HANDOFF_STORAGE_KEY );
	}
};

const clearPersistence = (): void => {
	storageHandler.removeItem( STORAGE_KEY );
	storageHandler.removeItem( STORAGE_TS_KEY );
	getSessionStorage()?.removeItem( HANDOFF_STORAGE_KEY );
};

// Handle data expiration and login handoffs through the @wp/data persistence plugin.
export const oneWeekPersistenceStorage: Pick< Storage, 'getItem' | 'setItem' > = {
	getItem( key ) {
		if ( hasFreshParam() ) {
			clearPersistence();
			return null;
		}

		const timestamp = storageHandler.getItem( STORAGE_TS_KEY );
		const value = timestamp && isNotExpired( timestamp ) ? storageHandler.getItem( key ) : null;
		const handoff = getLoggedOutOdieChatHandoff();

		if ( handoff ) {
			return mergeLoggedOutOdieChatHandoff( value, handoff );
		}

		if ( value ) {
			return value;
		}

		clearPersistence();
		return null;
	},
	setItem( key, value ) {
		const timestamp = Date.now();
		storageHandler.setItem( STORAGE_TS_KEY, JSON.stringify( timestamp ) );
		storageHandler.setItem( key, value );
		setLoggedOutOdieChatHandoff( value, timestamp );
	},
};

const persistOptions = {
	storageKey: STORAGE_KEY,
	storage: oneWeekPersistenceStorage,
};

export default persistOptions;
