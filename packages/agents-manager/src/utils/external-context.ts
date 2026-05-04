import type { ReactNode } from 'react';
import type { ContextEntry } from '../extension-types';

export type ExternalContextDelivery = 'next-message' | 'conversation';

export interface ExternalContextEntry extends Omit< ContextEntry, 'type' > {
	type?: string;
	contentType?: string;
	source?: string;
	title?: string;
	description?: string;
	payload?: unknown;
	delivery?: ExternalContextDelivery;
	createdAt?: string;
	expiresAt?: string;
}

export interface ExternalContextCardAction {
	id?: string;
	label: string;
	prompt?: string;
	type?: 'prefill' | 'submit';
}

export interface ExternalContextCard {
	id: string;
	contextEntryId?: string;
	/**
	 * Publisher-owned card body. Agents Manager renders this inside its
	 * card frame and only adds the dismiss affordance plus the actions row.
	 */
	body: ReactNode;
	actions?: ExternalContextCardAction[];
	createdAt?: string;
	expiresAt?: string;
}

const EXTERNAL_CONTEXT_CHANGE_EVENT = 'agents-manager-context-change';

const contextEntries = new Map< string, ExternalContextEntry >();
const contextCards = new Map< string, ExternalContextCard >();

function hasExpired( item: { expiresAt?: string } ): boolean {
	if ( ! item.expiresAt ) {
		return false;
	}

	const expiresAt = Date.parse( item.expiresAt );
	return Number.isFinite( expiresAt ) && expiresAt <= Date.now();
}

function emitExternalContextChange(): void {
	if ( typeof window === 'undefined' ) {
		return;
	}

	window.dispatchEvent( new CustomEvent( EXTERNAL_CONTEXT_CHANGE_EVENT ) );
}

function pruneExpiredContext(): void {
	let changed = false;

	for ( const [ id, entry ] of contextEntries ) {
		if ( hasExpired( entry ) ) {
			contextEntries.delete( id );
			changed = true;
		}
	}

	for ( const [ id, card ] of contextCards ) {
		if (
			hasExpired( card ) ||
			( card.contextEntryId && ! contextEntries.has( card.contextEntryId ) )
		) {
			contextCards.delete( id );
			changed = true;
		}
	}

	if ( changed ) {
		emitExternalContextChange();
	}
}

function toContextEntry( entry: ExternalContextEntry ): ContextEntry {
	const {
		contentType,
		delivery,
		payload,
		source,
		title,
		description,
		createdAt,
		expiresAt,
		...rest
	} = entry;

	return {
		...rest,
		type: entry.type || contentType || 'external-context',
		data: rest.data ?? payload,
		source,
		title,
		description,
		createdAt,
		expiresAt,
	} as ContextEntry;
}

export function setExternalContextEntry( entry: ExternalContextEntry ): void {
	if ( ! entry?.id ) {
		return;
	}

	contextEntries.set( entry.id, {
		...entry,
		delivery: entry.delivery || 'next-message',
		createdAt: entry.createdAt || new Date().toISOString(),
	} );
	emitExternalContextChange();
}

export function removeExternalContextEntry( id: string ): void {
	if ( ! id ) {
		return;
	}

	contextEntries.delete( id );
	for ( const [ cardId, card ] of contextCards ) {
		if ( card.contextEntryId === id ) {
			contextCards.delete( cardId );
		}
	}
	emitExternalContextChange();
}

export function clearExternalContextEntries(): void {
	contextEntries.clear();
	contextCards.clear();
	emitExternalContextChange();
}

export function getExternalContextEntries(): ContextEntry[] {
	pruneExpiredContext();
	return Array.from( contextEntries.values(), toContextEntry );
}

export function consumeNextMessageExternalContextEntries(): void {
	let changed = false;

	for ( const [ id, entry ] of contextEntries ) {
		if ( ( entry.delivery || 'next-message' ) === 'next-message' ) {
			contextEntries.delete( id );
			for ( const [ cardId, card ] of contextCards ) {
				if ( card.contextEntryId === id ) {
					contextCards.delete( cardId );
				}
			}
			changed = true;
		}
	}

	if ( changed ) {
		emitExternalContextChange();
	}
}

export function setExternalContextCard( card: ExternalContextCard ): void {
	if ( ! card?.id ) {
		return;
	}

	contextCards.set( card.id, {
		...card,
		createdAt: card.createdAt || new Date().toISOString(),
	} );
	emitExternalContextChange();
}

export function removeExternalContextCard( id: string ): void {
	if ( ! id ) {
		return;
	}

	contextCards.delete( id );
	emitExternalContextChange();
}

export function clearExternalContextCards(): void {
	contextCards.clear();
	emitExternalContextChange();
}

export function getExternalContextCards(): ExternalContextCard[] {
	pruneExpiredContext();
	return Array.from( contextCards.values() );
}

export function subscribeToExternalContext( callback: () => void ): () => void {
	if ( typeof window === 'undefined' ) {
		return () => {};
	}

	window.addEventListener( EXTERNAL_CONTEXT_CHANGE_EVENT, callback );
	return () => window.removeEventListener( EXTERNAL_CONTEXT_CHANGE_EVENT, callback );
}
