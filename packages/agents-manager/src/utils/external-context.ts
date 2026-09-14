import type { ContextEntry } from '../extension-types';
import type { ReactNode } from 'react';

export type ExternalContextDelivery = 'next-message' | 'conversation';

export interface ExternalContextEntry extends Omit< ContextEntry, 'type' > {
	type?: string;
	source?: string;
	title?: string;
	description?: string;
	delivery?: ExternalContextDelivery;
	createdAt?: string;
}

export interface ExternalContextCardAction {
	id?: string;
	label: string;
	prompt?: string;
	type?: 'prefill' | 'submit';
}

export interface ExternalContextCard {
	id: string;
	/**
	 * IDs of context entries linked to this card. When the card is dismissed
	 * or any of these entries is consumed/removed, both sides are cleaned up
	 * together. A card can reference multiple entries — useful when a single
	 * visual aggregates data from several sources.
	 */
	contextEntryIds?: string[];
	/**
	 * Publisher-owned card body. Agents Manager renders this inside its
	 * card frame and only adds the dismiss affordance plus the actions row.
	 */
	body: ReactNode;
	actions?: ExternalContextCardAction[];
	createdAt?: string;
}

const EXTERNAL_CONTEXT_CHANGE_EVENT = 'agents-manager-context-change';

const contextEntries = new Map< string, ExternalContextEntry >();
const contextCards = new Map< string, ExternalContextCard >();

// Stable snapshots regenerated on each mutation. Required for React 18's
// useSyncExternalStore — it compares snapshot identity to decide whether
// to re-render, so returning a fresh array on every read would loop.
let entriesSnapshot: ContextEntry[] = [];
let cardsSnapshot: ExternalContextCard[] = [];

function toContextEntry( entry: ExternalContextEntry ): ContextEntry {
	const { delivery, ...rest } = entry;
	return {
		...rest,
		type: entry.type || 'external-context',
	} as ContextEntry;
}

function refreshSnapshots(): void {
	entriesSnapshot = Array.from( contextEntries.values(), toContextEntry );
	cardsSnapshot = Array.from( contextCards.values() );
}

function emitExternalContextChange(): void {
	refreshSnapshots();
	if ( typeof window === 'undefined' ) {
		return;
	}
	window.dispatchEvent( new CustomEvent( EXTERNAL_CONTEXT_CHANGE_EVENT ) );
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
		if ( card.contextEntryIds?.includes( id ) ) {
			contextCards.delete( cardId );
		}
	}
	emitExternalContextChange();
}

export function getExternalContextEntries(): ContextEntry[] {
	return entriesSnapshot;
}

export function consumeNextMessageExternalContextEntries(): void {
	let changed = false;

	for ( const [ id, entry ] of contextEntries ) {
		if ( ( entry.delivery || 'next-message' ) === 'next-message' ) {
			contextEntries.delete( id );
			for ( const [ cardId, card ] of contextCards ) {
				if ( card.contextEntryIds?.includes( id ) ) {
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

export function getExternalContextCards(): ExternalContextCard[] {
	return cardsSnapshot;
}

export function subscribeToExternalContext( callback: () => void ): () => void {
	if ( typeof window === 'undefined' ) {
		return () => {};
	}

	window.addEventListener( EXTERNAL_CONTEXT_CHANGE_EVENT, callback );
	return () => window.removeEventListener( EXTERNAL_CONTEXT_CHANGE_EVENT, callback );
}
