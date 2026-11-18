import { useEffect, useState, type ReactNode } from 'react';
import { Provider, useSelector } from 'react-redux';
import { getClient, initClient, showNotes } from '../app/client';
import { AppProvider } from '../app/context';
import ErrorBoundary from '../app/error-boundary';
import Note from '../app/note';
import { useNoteNavigation } from '../app/note/hooks';
import NotePanel, { getNotificationTabs } from '../app/note-panel';
import { store } from '../panel/state';
import actions from '../panel/state/actions';
import { addListeners, removeListeners } from '../panel/state/create-listener-middleware';
import getAllNotes from '../panel/state/selectors/get-all-notes';
import getKeyboardShortcutsEnabled from '../panel/state/selectors/get-keyboard-shortcuts-enabled';
import { interceptLinks } from '../panel/utils/link-interceptor';
import type { FilterName, Note as NoteObject } from '../app/types';

import '../app/style.scss';

type InboxPaneElements = {
	list: ReactNode;
	detail: ReactNode;
};

type NotificationsInboxProps = {
	wpcom: unknown;
	locale: string;
	/** The tab to show, as named in the host's address. An unknown name shows every notification. */
	filterName: string | undefined;
	setFilterName: ( filterName: FilterName ) => void;
	selectedNoteId: string | undefined;
	setSelectedNoteId: ( noteId: string | undefined ) => void;
	renderLayout: ( panes: InboxPaneElements ) => ReactNode;
};

const openInNewTab = ( _store: unknown, action: unknown ) => {
	const { href } = action as { href: string };
	window.open( href, '_blank', 'noopener' );
};

const LINK_ACTION_HANDLERS = {
	EDIT_COMMENT: [ openInNewTab ],
	ANSWER_PROMPT: [ openInNewTab ],
	OPEN_LINK: [ openInNewTab ],
	OPEN_POST: [ openInNewTab ],
	OPEN_COMMENT: [ openInNewTab ],
	OPEN_SITE: [ openInNewTab ],
};

/**
 * Starts the shared notifications client, keeps it showing while the inbox is mounted, and returns whether it is ready.
 */
function useInboxClient( wpcom: unknown, locale: string ): boolean {
	const [ isReady, setIsReady ] = useState( !! getClient() );

	useEffect( () => {
		initClient( wpcom, { includeNoteContext: true } );
		setIsReady( true );

		store.dispatch( addListeners( LINK_ACTION_HANDLERS ) );
		const hideNotes = showNotes();

		return () => {
			store.dispatch( removeListeners( LINK_ACTION_HANDLERS ) );
			hideNotes();
		};
	}, [ wpcom ] );

	useEffect( () => {
		getClient()?.setLocale( locale );
	}, [ isReady, locale ] );

	return isReady;
}

const toFilterName = ( name: string | undefined ): FilterName =>
	( getNotificationTabs().find( ( tab ) => tab.name === name )?.name ?? 'all' ) as FilterName;

function InboxPanes( {
	filterName: requestedFilterName,
	setFilterName,
	selectedNoteId,
	setSelectedNoteId,
	renderLayout,
}: Omit< NotificationsInboxProps, 'wpcom' | 'locale' > ) {
	const filterName = toFilterName( requestedFilterName );
	const noteNavigation = useNoteNavigation( { filterName, selectedNoteId, setSelectedNoteId } );
	const isSelectedNoteLoaded = useSelector( ( state ) =>
		( ( getAllNotes( state ) || [] ) as NoteObject[] ).some(
			( note ) => String( note.id ) === selectedNoteId
		)
	);

	const areKeyboardShortcutsEnabled = useSelector( getKeyboardShortcutsEnabled );

	useEffect( () => {
		if ( selectedNoteId && ! isSelectedNoteLoaded ) {
			getClient()?.getNote( Number( selectedNoteId ) );
		}
	}, [ selectedNoteId, isSelectedNoteLoaded ] );

	useEffect( () => {
		if ( areKeyboardShortcutsEnabled ) {
			store.dispatch( actions.ui.disableKeyboardShortcuts() );
		}
	}, [ areKeyboardShortcutsEnabled ] );

	return (
		<div
			className="wpnc-app"
			onClick={ ( event ) => store.dispatch( interceptLinks( event ) ) }
			role="presentation"
		>
			{ renderLayout( {
				list: (
					<ErrorBoundary>
						<NotePanel
							headingLevel={ 1 }
							actions={ null }
							filterName={ filterName }
							setFilterName={ setFilterName }
							selectedNoteId={ selectedNoteId }
							setSelectedNoteId={ setSelectedNoteId }
							openNoteOnArrowKeys
						/>
					</ErrorBoundary>
				),
				detail: isSelectedNoteLoaded && (
					<ErrorBoundary>
						<Note
							noteId={ selectedNoteId }
							setSelectedNoteId={ setSelectedNoteId }
							noteNavigation={ noteNavigation }
						/>
					</ErrorBoundary>
				),
			} ) }
		</div>
	);
}

/**
 * Renders the panel's heading, tabs and notes list, and the selected note, on a full page laid out by the host.
 */
export default function NotificationsInbox( {
	wpcom,
	locale,
	...paneProps
}: NotificationsInboxProps ) {
	const isReady = useInboxClient( wpcom, locale );

	if ( ! isReady ) {
		return null;
	}

	return (
		<Provider store={ store }>
			<AppProvider client={ getClient() } locale={ locale } isViewSettingsEnabled>
				<InboxPanes { ...paneProps } />
			</AppProvider>
		</Provider>
	);
}
