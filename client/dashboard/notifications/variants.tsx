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

/** Props the detail pane slot receives (the default is NoteDetail). */
export type DetailPaneSlotProps = {
	noteId: string;
	onClose: () => void;
	onPrevious?: ( () => void ) | null;
	onNext?: ( () => void ) | null;
};

/** The rendered panes, for a variant that arranges the screen itself. */
export type ShellSlotProps = {
	list: React.ReactNode;
	detail: React.ReactNode;
	hasSelectedNote: boolean;
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
	/** Replace the whole detail pane, frame and nav included. */
	DetailPane?: ComponentType< DetailPaneSlotProps >;
	/** Replace the list pane. */
	List?: ComponentType< InboxListSlotProps >;
	/** Arrange the screen itself (panes come in rendered; wrap or place them freely). */
	Shell?: ComponentType< ShellSlotProps >;
};

/**
 * Register experiments here. The picker only appears when there is more than
 * one entry, so a default-only registry adds no UI.
 *
 * Base or variant? A change every design should get — data, behaviour, fixes,
 * anything in the model or engine — lands in the base files. A change meant to
 * be compared against the current design lands in a variant. If a variant
 * needs data the model doesn't expose, extend NoteView for everyone instead of
 * deriving it inside the variant.
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
