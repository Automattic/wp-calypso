import { useEffect, useState, type ReactNode } from 'react';
import { Provider, useSelector } from 'react-redux';
import { getClient, initClient } from '../app/client';
import { AppProvider } from '../app/context';
import ErrorBoundary from '../app/error-boundary';
import Note from '../app/note';
import { useNoteNavigation } from '../app/note/hooks';
import NoteList from '../app/note-list';
import { store } from '../panel/state';
import { SET_IS_SHOWING } from '../panel/state/action-types';
import actions from '../panel/state/actions';
import { addListeners, removeListeners } from '../panel/state/create-listener-middleware';
import getAllNotes from '../panel/state/selectors/get-all-notes';
import getKeyboardShortcutsEnabled from '../panel/state/selectors/get-keyboard-shortcuts-enabled';
import { interceptLinks } from '../panel/utils/link-interceptor';
import NoteActions, { type InboxUser } from './note-actions';
import type { FilterName, Note as NoteObject } from '../app/types';

type InboxPaneElements = {
	list: ReactNode;
	detail: ReactNode;
};

type NotificationsInboxProps = {
	wpcom: unknown;
	locale: string;
	currentUser: InboxUser;
	filterName: FilterName;
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

		store.dispatch( { type: SET_IS_SHOWING, isShowing: true } );
		store.dispatch( addListeners( LINK_ACTION_HANDLERS ) );
		getClient()?.setVisibility( { isShowing: true, isVisible: ! document.hidden } );

		return () => {
			store.dispatch( removeListeners( LINK_ACTION_HANDLERS ) );
			store.dispatch( { type: SET_IS_SHOWING, isShowing: false } );
			getClient()?.setVisibility( { isShowing: false, isVisible: ! document.hidden } );
		};
	}, [ wpcom ] );

	useEffect( () => {
		getClient()?.setLocale( locale );
	}, [ isReady, locale ] );

	return isReady;
}

function InboxPanes( {
	currentUser,
	filterName,
	selectedNoteId,
	setSelectedNoteId,
	renderLayout,
}: Omit< NotificationsInboxProps, 'wpcom' | 'locale' > ) {
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
						<NoteList
							key={ filterName }
							filterName={ filterName }
							selectedNoteId={ selectedNoteId }
							setSelectedNoteId={ setSelectedNoteId }
						/>
					</ErrorBoundary>
				),
				detail: isSelectedNoteLoaded && (
					<ErrorBoundary>
						<Note
							noteId={ selectedNoteId }
							setSelectedNoteId={ setSelectedNoteId }
							noteNavigation={ noteNavigation }
							renderActions={ ( note, goBack ) => (
								<NoteActions note={ note } goBack={ goBack } currentUser={ currentUser } />
							) }
						/>
					</ErrorBoundary>
				),
			} ) }
		</div>
	);
}

/**
 * Renders the notes list and the selected note on a full page, laid out by the host.
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
			<AppProvider
				client={ getClient() }
				locale={ locale }
				isViewSettingsEnabled
				isSimplifiedNoteEnabled
			>
				<InboxPanes { ...paneProps } />
			</AppProvider>
		</Provider>
	);
}
