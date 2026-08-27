/**
 * Read-only access to agenttic-client's local conversation store, which it keeps
 * in `sessionStorage` under `<CONVERSATION_STORAGE_KEY>_<storageKey>`. We read it
 * directly because the package re-exports the reconciliation primitives but not
 * `loadConversation` / `getStoredSessionIds`.
 */
import {
	CONVERSATION_STORAGE_KEY,
	type DeliveryStatus,
	type Message,
} from '@automattic/agenttic-client';

export const STORAGE_PREFIX = `${ CONVERSATION_STORAGE_KEY }_`;

interface StoredMessage {
	role: 'user' | 'agent';
	content: string;
	timestamp: number;
	deliveryStatus?: DeliveryStatus;
}

interface StoredConversation {
	storageKey: string;
	messages: StoredMessage[];
	lastUpdated: number;
}

export interface LoadedConversation {
	storageKey: string;
	messages: Message[];
	lastUpdated: number;
}

/**
 * Whether a storage key is a client-minted placeholder — agenttic mints these
 * for a send that never reached the server — rather than a server session UUID.
 * @param storageKey
 */
export function isLocalSessionKey( storageKey: string ): boolean {
	return storageKey.startsWith( 'local-' );
}

/**
 * Restore a stored message into the minimal `Message` shape the reconciliation
 * primitives read: they match user turns by text and read `deliveryStatus`.
 * @param stored
 */
function restoreMessage( stored: StoredMessage ): Message {
	return {
		role: stored.role,
		kind: 'message',
		parts:
			stored.content && stored.content !== '(No text content)'
				? [ { type: 'text', text: stored.content } ]
				: [],
		// A fresh id is fine: reconciliation regenerates ids on restore and
		// matches turns by text, not id.
		messageId: `restored-${ stored.timestamp }-${ Math.random().toString( 36 ).slice( 2 ) }`,
		metadata: {
			timestamp: stored.timestamp,
			...( stored.deliveryStatus && { deliveryStatus: stored.deliveryStatus } ),
		},
	};
}

function parseConversation( raw: string, storageKey: string ): LoadedConversation | null {
	try {
		const parsed = JSON.parse( raw ) as StoredConversation;
		if ( ! Array.isArray( parsed.messages ) ) {
			return null;
		}
		return {
			storageKey: parsed.storageKey || storageKey,
			messages: parsed.messages.map( restoreMessage ),
			lastUpdated: parsed.lastUpdated ?? 0,
		};
	} catch {
		return null;
	}
}

/**
 * Enumerate every locally-stored conversation. Returns `[]` when
 * `sessionStorage` is unavailable (private mode, SSR) or on any read error.
 */
export function listStoredConversations(): LoadedConversation[] {
	if ( typeof sessionStorage === 'undefined' ) {
		return [];
	}

	const conversations: LoadedConversation[] = [];
	try {
		for ( let index = 0; index < sessionStorage.length; index++ ) {
			const key = sessionStorage.key( index );
			if ( ! key || ! key.startsWith( STORAGE_PREFIX ) ) {
				continue;
			}
			const raw = sessionStorage.getItem( key );
			if ( ! raw ) {
				continue;
			}
			const storageKey = key.slice( STORAGE_PREFIX.length );
			const conversation = parseConversation( raw, storageKey );
			if ( conversation ) {
				conversations.push( conversation );
			}
		}
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[conversation-storage-read] Failed to enumerate conversations:', error );
		return [];
	}

	return conversations;
}

/**
 * Remove a stored conversation. Called after an orphaned turn is surfaced as
 * `failed` so it does not re-fire reconciliation on the next mount.
 * @param storageKey
 */
export function clearStoredConversation( storageKey: string ): void {
	if ( typeof sessionStorage === 'undefined' ) {
		return;
	}
	try {
		sessionStorage.removeItem( `${ STORAGE_PREFIX }${ storageKey }` );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[conversation-storage-read] Failed to clear conversation:', error );
	}
}
