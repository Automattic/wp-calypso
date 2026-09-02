import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createContext, useContext, useState } from 'react';
import type { NoteView } from './note-model';
import type { ComponentType } from 'react';

type DetailViewOverrides = {
	[ K in NoteView[ 'kind' ] ]?: ComponentType< { view: Extract< NoteView, { kind: K } > } >;
};

/** Props the list slot receives; a variant's list must accept them. */
export type InboxListSlotProps = {
	category: string;
	selectedNoteId?: string;
	onSelectNote: ( noteId?: string ) => void;
	onFirstNoteLoaded: ( noteId: string ) => void;
};

/**
 * One testable version of the inbox. Everything is optional: a variant can be
 * a CSS skin (className), restyle one note kind (detailViews), replace the
 * whole detail pane (Detail), or swap the list (List). Unset parts fall back
 * to the default experience.
 */
export type InboxVariant = {
	key: string;
	label: string;
	/** Extra class on the inbox layout root, for CSS-only differences. */
	className?: string;
	/** Replace individual detail layouts by note kind. */
	detailViews?: DetailViewOverrides;
	/** Replace the detail content for every kind at once. */
	Detail?: ComponentType< { view: NoteView } >;
	/** Replace the list pane. */
	List?: ComponentType< InboxListSlotProps >;
};

/**
 * Register experiments here. The picker only appears when there is more than
 * one entry, so the default-only registry adds no UI.
 */
export const INBOX_VARIANTS: InboxVariant[] = [ { key: 'default', label: __( 'Default' ) } ];

const STORAGE_KEY = 'dashboard-notifications-inbox-variant';

const InboxVariantContext = createContext< InboxVariant >( INBOX_VARIANTS[ 0 ] );

export const InboxVariantProvider = InboxVariantContext.Provider;

export function useInboxVariant(): InboxVariant {
	return useContext( InboxVariantContext );
}

export function useInboxVariantState(): [ InboxVariant, ( key: string ) => void ] {
	const [ key, setKey ] = useState( () => {
		try {
			return window.localStorage.getItem( STORAGE_KEY ) ?? 'default';
		} catch {
			return 'default';
		}
	} );
	const variant = INBOX_VARIANTS.find( ( entry ) => entry.key === key ) ?? INBOX_VARIANTS[ 0 ];
	const set = ( next: string ) => {
		setKey( next );
		try {
			window.localStorage.setItem( STORAGE_KEY, next );
		} catch {
			// Per-tab only, then.
		}
	};
	return [ variant, set ];
}

export function InboxVariantPicker( {
	value,
	onChange,
}: {
	value: string;
	onChange: ( key: string ) => void;
} ) {
	if ( INBOX_VARIANTS.length < 2 ) {
		return null;
	}
	return (
		<SelectControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			label={ __( 'Layout' ) }
			hideLabelFromVision
			value={ value }
			options={ INBOX_VARIANTS.map( ( entry ) => ( {
				value: entry.key,
				label: entry.label,
			} ) ) }
			onChange={ onChange }
		/>
	);
}
