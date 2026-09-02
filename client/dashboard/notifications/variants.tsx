import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createContext, useContext, useState } from 'react';
import ClassicDetailPane from './classic';
import { InboxList } from './list';
import SlackThreadView from './slack';
import type { InboxCategory } from './list';
import type { NoteView } from './note-model';
import type { ComponentType } from 'react';

type DetailViewOverrides = {
	[ K in NoteView[ 'kind' ] ]?: ComponentType< { view: Extract< NoteView, { kind: K } > } >;
};

/** Props the list slot receives; a variant's list must accept them. */
export type InboxListSlotProps = {
	category: InboxCategory;
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
 * One testable version of the detail side (and the screen around it).
 * Everything is optional: a variant can be a CSS skin (className), restyle one
 * note kind (detailViews), replace the detail content (Detail) or the whole
 * pane (DetailPane), or arrange the screen (Shell). Unset parts fall back to
 * the default experience. The list has its own registry below.
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
	/** Arrange the screen itself (panes come in rendered; wrap or place them freely). */
	Shell?: ComponentType< ShellSlotProps >;
};

/** One testable version of the list pane. */
export type ListVariant = {
	key: string;
	label: string;
	/** Replace the list; unset falls back to the default InboxList. */
	List?: ComponentType< InboxListSlotProps >;
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
function ClassicInboxList( props: InboxListSlotProps ) {
	return (
		<InboxList
			key={ props.category }
			category={ props.category }
			selectedNoteId={ props.selectedNoteId }
			onSelectNote={ props.onSelectNote }
			onFirstNoteLoaded={ props.onFirstNoteLoaded }
			descriptionField="description"
		/>
	);
}

export const INBOX_VARIANTS: InboxVariant[] = [
	{ key: 'classic', label: __( 'Classic' ), DetailPane: ClassicDetailPane },
	{ key: 'default', label: __( 'P2-Inspired' ) },
	{
		key: 'slack',
		label: __( 'Slack-Inspired' ),
		detailViews: { thread: SlackThreadView },
	},
];

/** The list pane's own experiments, chosen independently of the detail side. */
export const LIST_VARIANTS: ListVariant[] = [
	{ key: 'simplified', label: __( 'Simplified' ) },
	{ key: 'classic', label: __( 'Classic' ), List: ClassicInboxList },
];

const STORAGE_KEY = 'dashboard-notifications-inbox-variant';
const LIST_STORAGE_KEY = 'dashboard-notifications-inbox-list-variant';

const InboxVariantContext = createContext< InboxVariant >( INBOX_VARIANTS[ 0 ] );

export const InboxVariantProvider = InboxVariantContext.Provider;

export function useInboxVariant(): InboxVariant {
	return useContext( InboxVariantContext );
}

function useStoredVariant< T extends { key: string } >(
	registry: T[],
	storageKey: string
): [ T, ( key: string ) => void ] {
	const [ key, setKey ] = useState( () => {
		try {
			return window.localStorage.getItem( storageKey ) ?? registry[ 0 ].key;
		} catch {
			return registry[ 0 ].key;
		}
	} );
	const variant = registry.find( ( entry ) => entry.key === key ) ?? registry[ 0 ];
	const set = ( next: string ) => {
		setKey( next );
		try {
			window.localStorage.setItem( storageKey, next );
		} catch {
			// Per-tab only, then.
		}
	};
	return [ variant, set ];
}

export function useInboxVariantState(): [ InboxVariant, ( key: string ) => void ] {
	return useStoredVariant( INBOX_VARIANTS, STORAGE_KEY );
}

export function useListVariantState(): [ ListVariant, ( key: string ) => void ] {
	return useStoredVariant( LIST_VARIANTS, LIST_STORAGE_KEY );
}

function VariantPicker( {
	label,
	registry,
	value,
	onChange,
}: {
	label: string;
	registry: Array< { key: string; label: string } >;
	value: string;
	onChange: ( key: string ) => void;
} ) {
	if ( registry.length < 2 ) {
		return null;
	}
	return (
		<HStack spacing={ 2 } expanded={ false } alignment="center">
			<Text style={ { whiteSpace: 'nowrap' } }>{ label }</Text>
			<SelectControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ label }
				hideLabelFromVision
				value={ value }
				options={ registry.map( ( entry ) => ( { value: entry.key, label: entry.label } ) ) }
				onChange={ onChange }
			/>
		</HStack>
	);
}

export function InboxVariantPicker( props: { value: string; onChange: ( key: string ) => void } ) {
	return <VariantPicker label={ __( 'Detail layout' ) } registry={ INBOX_VARIANTS } { ...props } />;
}

export function ListVariantPicker( props: { value: string; onChange: ( key: string ) => void } ) {
	return <VariantPicker label={ __( 'List layout' ) } registry={ LIST_VARIANTS } { ...props } />;
}
