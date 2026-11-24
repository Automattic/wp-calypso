import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Provider, useSelector } from 'react-redux';
import { getClient, initClient, showNotes } from '../app/client';
import { AppProvider } from '../app/context';
import ErrorBoundary from '../app/error-boundary';
import Note from '../app/note';
import { useNoteNavigation } from '../app/note/hooks';
import NotePanel, { getNotificationTabs } from '../app/note-panel';
import NoteSettingsButton from '../app/note-panel/settings-button';
import { isPanelMounted } from '../app/panel-mounted';
import { useTracksSurface, type TracksSurface } from '../app/use-tracks-surface';
import { store } from '../panel/state';
import { addListeners, removeListeners } from '../panel/state/create-listener-middleware';
import getAllNotes from '../panel/state/selectors/get-all-notes';
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
	/** Shows another tab. The host closes the open note in the same step. */
	setFilterName: ( filterName: FilterName ) => void;
	selectedNoteId: string | undefined;
	setSelectedNoteId: ( noteId: string | undefined ) => void;
	/** Opens the host's notification settings. Without it, the list header has no settings button. */
	onViewSettings?: () => void;
	/** Shows the open note's "Mark as unread" button. */
	isMarkAsUnreadEnabled?: boolean;
	/** Where the host shows the inbox, added to the Tracks events it records. */
	tracksSurface?: TracksSurface;
	renderLayout: ( panes: InboxPaneElements ) => ReactNode;
};

const openInNewTab = ( _store: unknown, action: unknown ) => {
	// A panel opened over the page opens its own links, and the store runs both hosts' handlers.
	if ( isPanelMounted() ) {
		return;
	}
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
	rootRef,
	filterName: requestedFilterName,
	setFilterName,
	selectedNoteId,
	setSelectedNoteId,
	onViewSettings,
	renderLayout,
}: Omit<
	NotificationsInboxProps,
	'wpcom' | 'locale' | 'isMarkAsUnreadEnabled' | 'tracksSurface'
> & {
	rootRef: RefObject< HTMLDivElement | null >;
} ) {
	const filterName = toFilterName( requestedFilterName );
	const noteNavigation = useNoteNavigation( { filterName, selectedNoteId, setSelectedNoteId } );
	const isSelectedNoteLoaded = useSelector( ( state ) =>
		( ( getAllNotes( state ) || [] ) as NoteObject[] ).some(
			( note ) => String( note.id ) === selectedNoteId
		)
	);

	const setSelectedNoteIdRef = useRef( setSelectedNoteId );

	useEffect( () => {
		setSelectedNoteIdRef.current = setSelectedNoteId;
	}, [ setSelectedNoteId ] );

	useEffect( () => {
		if ( ! selectedNoteId || isSelectedNoteLoaded ) {
			return;
		}
		let isCurrent = true;
		getClient()
			?.getNote( Number( selectedNoteId ) )
			?.then( ( found: boolean | undefined ) => {
				// A note the server doesn't have would leave an empty pane, so show the host's empty state instead.
				if ( isCurrent && found === false ) {
					setSelectedNoteIdRef.current( undefined );
				}
			} );
		return () => {
			isCurrent = false;
		};
	}, [ selectedNoteId, isSelectedNoteLoaded ] );

	const canViewSettings = !! onViewSettings;
	const onViewSettingsRef = useRef( onViewSettings );

	useEffect( () => {
		onViewSettingsRef.current = onViewSettings;
	}, [ onViewSettings ] );

	useEffect( () => {
		if ( ! canViewSettings ) {
			return;
		}
		const handlers = {
			VIEW_SETTINGS: [
				() => {
					// A panel opened over the page opens its own settings.
					if ( ! isPanelMounted() ) {
						onViewSettingsRef.current?.();
					}
				},
			],
		};
		store.dispatch( addListeners( handlers ) );

		return () => {
			store.dispatch( removeListeners( handlers ) );
		};
	}, [ canViewSettings ] );

	return (
		<div
			ref={ rootRef }
			className="wpnc-app"
			onClick={ ( event ) => store.dispatch( interceptLinks( event ) ) }
			role="presentation"
		>
			{ renderLayout( {
				list: (
					<ErrorBoundary>
						<NotePanel
							headingLevel={ 1 }
							actions={ canViewSettings ? <NoteSettingsButton /> : null }
							showMarkAllAsRead
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
	isMarkAsUnreadEnabled = false,
	tracksSurface,
	...paneProps
}: NotificationsInboxProps ) {
	const isReady = useInboxClient( wpcom, locale );
	const rootRef = useRef< HTMLDivElement >( null );
	useTracksSurface( tracksSurface );

	if ( ! isReady ) {
		return null;
	}

	return (
		<Provider store={ store }>
			<AppProvider
				client={ getClient() }
				locale={ locale }
				isViewSettingsEnabled
				isMarkAsUnreadEnabled={ isMarkAsUnreadEnabled }
				hasExpandedActions
				// The list moves with its own arrow keys, which open each note they reach.
				hasNavigationShortcuts={ false }
				shortcutScope={ rootRef }
			>
				<InboxPanes rootRef={ rootRef } { ...paneProps } />
			</AppProvider>
		</Provider>
	);
}
