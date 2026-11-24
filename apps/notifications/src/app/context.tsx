import { createContext, useContext, useMemo, type RefObject } from 'react';
import { recordTracksEvent } from '../panel/helpers/stats';
import type { Client, FilterName } from './types';

export type FullView = {
	filterName: FilterName;
	noteId?: string;
};

export type AppContextData = {
	client: Client | null;
	locale: string;
	isViewSettingsEnabled: boolean;
	isMarkAsUnreadEnabled: boolean;
	/** Shows more of a comment's actions as buttons, for a host with room for them. */
	hasExpandedActions: boolean;
	/** Moves through the tabs and notes with the panel's keyboard shortcuts, like `u` and `j`. */
	hasNavigationShortcuts: boolean;
	/**
	 * The element the host shows the notes in, when the page around it has other content. The open
	 * note's shortcuts then act only on key presses from inside it, or with nothing focused.
	 */
	shortcutScope?: RefObject< HTMLElement | null >;
	onOpenFullView?: ( view: FullView ) => void;
};

const AppContext = createContext< AppContextData >( {
	client: null,
	locale: 'en',
	isViewSettingsEnabled: false,
	isMarkAsUnreadEnabled: false,
	hasExpandedActions: false,
	hasNavigationShortcuts: true,
} );

export const AppProvider = ( {
	client,
	locale,
	isViewSettingsEnabled = false,
	isMarkAsUnreadEnabled = false,
	hasExpandedActions = false,
	hasNavigationShortcuts = true,
	shortcutScope,
	onOpenFullView,
	children,
}: {
	client: Client | null;
	locale: string;
	isViewSettingsEnabled?: boolean;
	isMarkAsUnreadEnabled?: boolean;
	hasExpandedActions?: boolean;
	hasNavigationShortcuts?: boolean;
	shortcutScope?: RefObject< HTMLElement | null >;
	onOpenFullView?: ( view: FullView ) => void;
	children: React.ReactNode;
} ) => {
	const value = useMemo(
		() => ( {
			client,
			locale,
			isViewSettingsEnabled,
			isMarkAsUnreadEnabled,
			hasExpandedActions,
			hasNavigationShortcuts,
			shortcutScope,
			onOpenFullView,
		} ),
		[
			client,
			locale,
			isViewSettingsEnabled,
			isMarkAsUnreadEnabled,
			hasExpandedActions,
			hasNavigationShortcuts,
			shortcutScope,
			onOpenFullView,
		]
	);

	return <AppContext.Provider value={ value }>{ children }</AppContext.Provider>;
};

export const useAppContext = () => useContext( AppContext );

/**
 * Whether the note inside is open. A note that has closed stays on screen while it slides out of
 * the panel, but its shortcuts must stop at once: the list's shortcuts use the same keys.
 */
export const NoteOpenContext = createContext( true );

/**
 * Returns a function that opens the host's full view on the given tab and note, or nothing when the host has no full view.
 */
export const useOpenFullView = ( { filterName, noteId }: FullView ) => {
	const { onOpenFullView } = useAppContext();

	if ( ! onOpenFullView ) {
		return undefined;
	}

	return () => {
		recordTracksEvent( 'calypso_notification_full_view_click', {
			tab: filterName,
			is_note_open: !! noteId,
		} );
		onOpenFullView( { filterName, noteId } );
	};
};
