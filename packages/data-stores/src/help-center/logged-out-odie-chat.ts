import type { LoggedOutOdieChat } from './types';

const LOGGED_OUT_ODIE_CHAT_STORAGE_PREFIX = 'WPCOM_LOGGED_OUT_ODIE_CHAT_';
const HANDOFF_SUFFIX = '_PENDING_HANDOFF';
const PERSISTENCE_INTERVAL = 7 * 24 * 60 * 60 * 1000;

type PersistedLoggedOutOdieChat = {
	session: LoggedOutOdieChat;
	timestamp: number;
};

export const isLoggedOutOdieChat = ( value: unknown ): value is LoggedOutOdieChat =>
	typeof value === 'object' &&
	value !== null &&
	'botSlug' in value &&
	typeof value.botSlug === 'string';

const isPersistedLoggedOutOdieChat = ( value: unknown ): value is PersistedLoggedOutOdieChat =>
	typeof value === 'object' &&
	value !== null &&
	'session' in value &&
	isLoggedOutOdieChat( value.session ) &&
	typeof value.session.odieId === 'number' &&
	typeof value.session.sessionId === 'string' &&
	'timestamp' in value &&
	typeof value.timestamp === 'number';

const getStorage = (): Storage | undefined => {
	try {
		return typeof window === 'undefined' ? undefined : window.localStorage;
	} catch {
		return undefined;
	}
};

const getStorageKey = ( botSlug: string ) =>
	`${ LOGGED_OUT_ODIE_CHAT_STORAGE_PREFIX }${ encodeURIComponent( botSlug ) }`;

const getHandoffKey = ( botSlug: string ) => `${ getStorageKey( botSlug ) }${ HANDOFF_SUFFIX }`;

export const persistLoggedOutOdieChat = (
	session: LoggedOutOdieChat,
	shouldHandOff: boolean
): void => {
	const storage = getStorage();

	if ( ! storage ) {
		return;
	}

	try {
		storage.setItem(
			getStorageKey( session.botSlug ),
			JSON.stringify( { session, timestamp: Date.now() } satisfies PersistedLoggedOutOdieChat )
		);
		if ( shouldHandOff ) {
			storage.setItem( getHandoffKey( session.botSlug ), 'true' );
		}
	} catch {
		// The Help Center store remains the fallback when local storage is unavailable.
	}
};

export const getPersistedLoggedOutOdieChat = ( botSlug: string ): LoggedOutOdieChat | undefined => {
	const storage = getStorage();

	if ( ! storage ) {
		return undefined;
	}

	try {
		const value = storage.getItem( getStorageKey( botSlug ) );
		const persisted: unknown = value ? JSON.parse( value ) : undefined;

		if (
			! isPersistedLoggedOutOdieChat( persisted ) ||
			persisted.session.botSlug !== botSlug ||
			persisted.timestamp + PERSISTENCE_INTERVAL <= Date.now()
		) {
			storage.removeItem( getStorageKey( botSlug ) );
			storage.removeItem( getHandoffKey( botSlug ) );
			return undefined;
		}

		return persisted.session;
	} catch {
		return undefined;
	}
};

export const getPendingLoggedOutOdieChat = ( botSlug: string ): LoggedOutOdieChat | undefined => {
	const storage = getStorage();
	const session = getPersistedLoggedOutOdieChat( botSlug );

	if ( ! storage || ! session ) {
		return undefined;
	}

	try {
		return storage.getItem( getHandoffKey( botSlug ) ) === 'true' ? session : undefined;
	} catch {
		return undefined;
	}
};

export const consumeLoggedOutOdieChatHandoff = ( botSlug: string ): void => {
	try {
		getStorage()?.removeItem( getHandoffKey( botSlug ) );
	} catch {
		// Leave the marker in place when local storage is unavailable.
	}
};
