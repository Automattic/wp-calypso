import { __experimentalHStack as HStack } from '@wordpress/components';
import clsx from 'clsx';
import { useEffect, useState, type TransitionEvent } from 'react';
import { Provider } from 'react-redux';
import repliesCache from '../panel/comment-replies-cache';
import { modifierKeyIsActive } from '../panel/helpers/input';
import { logError } from '../panel/helpers/log-error';
import { fetchNotificationPreferences } from '../panel/rest-client/wpcom';
import { init as initStore, store } from '../panel/state';
import { SET_IS_SHOWING } from '../panel/state/action-types';
import actions from '../panel/state/actions';
import { addListeners, removeListeners } from '../panel/state/create-listener-middleware';
import getIsPanelOpen from '../panel/state/selectors/get-is-panel-open';
import getKeyboardShortcutsEnabled from '../panel/state/selectors/get-keyboard-shortcuts-enabled';
import { getClient, initClient } from './client';
import { AppProvider } from './context';
import ErrorBoundary from './error-boundary';
import Note from './note';
import { useNoteNavigation } from './note/hooks';
import NotePanel from './note-panel';
import type { FilterName } from './types';

import './style.scss';

repliesCache.cleanup();

export type NotificationPreferences = {
	layoutStyle?: string;
	viewSettingsSeen?: boolean;
};

let hasResolvedPreferences = false;

const applyPreferences = ( { layoutStyle, viewSettingsSeen }: NotificationPreferences ) => {
	if ( layoutStyle ) {
		store.dispatch( actions.ui.setLayoutStyle( layoutStyle ) );
	}
	// Always dispatched, so an absent preference resolves to "not seen" rather
	// than staying unknown.
	store.dispatch( actions.ui.setViewSettingsSeen( !! viewSettingsSeen ) );
};

/**
 * Force a manual refresh of the notes data
 */
export const refreshNotes = () => getClient()?.refreshNotes();

const defaultHandlers = {
	APP_REFRESH_NOTES: [
		( _store: any, action: any ) => {
			const client = getClient();
			if ( ! client ) {
				return;
			}

			if ( 'boolean' === typeof action.isVisible ) {
				// Use this.props instead of destructuring isShowing, so that this uses
				// the value on props at any given time and not only the value that was
				// present on initial mount.
				client.setVisibility.call( client, {
					isShowing: getIsPanelOpen( _store.getState() ),
					isVisible: action.isVisible,
				} );
			}

			client.refreshNotes.call( client );
		},
	],
};

const NotificationContent = ( { isDismissible }: { isDismissible: boolean } ) => {
	const [ filterName, setFilterName ] = useState< FilterName >( 'all' );
	const [ selectedNoteId, setSelectedNoteId ] = useState< string | undefined >( undefined );
	const isDetailOpen = selectedNoteId !== undefined;

	// Hold the last selected note id so it keeps rendering through the
	// slide-out animation, then clear it on transitionend.
	const [ exitingNoteId, setExitingNoteId ] = useState< string | undefined >( undefined );
	useEffect( () => {
		if ( selectedNoteId !== undefined ) {
			setExitingNoteId( selectedNoteId );
		}
	}, [ selectedNoteId ] );
	const displayedNoteId = selectedNoteId ?? exitingNoteId;

	const handleDetailPaneTransitionEnd = ( event: TransitionEvent< HTMLDivElement > ) => {
		if ( event.target !== event.currentTarget ) {
			return;
		}
		if ( event.propertyName !== 'transform' ) {
			return;
		}
		if ( ! isDetailOpen ) {
			setExitingNoteId( undefined );
		}
	};

	const noteNavigation = useNoteNavigation( { filterName, selectedNoteId, setSelectedNoteId } );

	return (
		<HStack className="wpnc-app" spacing={ 0 } alignment="stretch">
			<div
				className={ clsx( 'wpnc-app__detail-pane', { 'is-open': isDetailOpen } ) }
				onTransitionEnd={ handleDetailPaneTransitionEnd }
				// Keep the pane interactive through the exit transition: it's
				// still on-screen sliding out and `displayedNoteId` is still
				// set. Flipping `inert` synchronously on `isDetailOpen` (the
				// "should be open" intent) instead of `displayedNoteId` (what's
				// actually showing) drops focus from the Back button mid-render
				// and trips the host popover's focus-outside close on mobile.
				// @ts-expect-error React 18 types don't include `inert`.
				inert={ displayedNoteId === undefined ? '' : undefined }
			>
				<ErrorBoundary>
					<Note
						isDismissible={ isDismissible }
						noteId={ displayedNoteId }
						setSelectedNoteId={ setSelectedNoteId }
						noteNavigation={ noteNavigation }
					/>
				</ErrorBoundary>
			</div>
			<div className="wpnc-app__list-pane">
				<NotePanel
					isDismissible={ isDismissible }
					filterName={ filterName }
					setFilterName={ setFilterName }
					selectedNoteId={ selectedNoteId }
					setSelectedNoteId={ setSelectedNoteId }
				/>
			</div>
		</HStack>
	);
};

const NotificationApp = ( {
	locale = 'en',
	isDismissible = false,
	isViewSettingsEnabled = false,
	preferences,
	customEnhancer,
	actionHandlers = {},
	wpcom,
}: {
	locale?: string;
	isDismissible?: boolean;
	isViewSettingsEnabled?: boolean;
	/**
	 * Supplied by hosts that already hold the user's preferences, so the panel does
	 *  not have to fetch them and paint its defaults while it waits.
	 */
	preferences?: NotificationPreferences;
	customEnhancer?: any;
	actionHandlers?: any;
	wpcom: any;
} ) => {
	const [ isReady, setIsReady ] = useState( !! getClient() );

	useEffect( () => {
		initClient( wpcom );
		setIsReady( true );

		store.dispatch( { type: 'APP_IS_READY' } );
		store.dispatch( { type: SET_IS_SHOWING, isShowing: true } );
		getClient()?.setVisibility( { isShowing: true, isVisible: ! document.hidden } );

		// Once per session, not per mount: in the dashboard the panel lives inside a
		// dropdown and remounts on every open, and a late response would also overwrite a
		// change the view picker had just made.
		if ( ! hasResolvedPreferences ) {
			hasResolvedPreferences = true;
			// A host that already holds these hands them over, and they land before the
			// panel first paints. Fetching them here instead would paint the defaults and
			// then move the tabs under the reader.
			if ( preferences ) {
				applyPreferences( preferences );
			} else {
				fetchNotificationPreferences().then( applyPreferences ).catch( logError );
			}
		}

		return () => {
			store.dispatch( { type: SET_IS_SHOWING, isShowing: false } );
			getClient()?.setVisibility( { isShowing: false, isVisible: ! document.hidden } );
		};
		// `preferences` is read once, on mount. Re-running on a later value would
		// re-announce the panel as showing and overwrite whatever the picker has since
		// saved.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ wpcom ] );

	useEffect( () => {
		if ( customEnhancer ) {
			initStore( { customEnhancer } );
		}
	}, [ customEnhancer ] );

	useEffect( () => {
		getClient()?.setLocale( locale );
	}, [ locale ] );

	useEffect( () => {
		store.dispatch( addListeners( actionHandlers ) );
		store.dispatch( addListeners( defaultHandlers ) );

		return () => {
			store.dispatch( removeListeners( actionHandlers ) );
			store.dispatch( removeListeners( defaultHandlers ) );
		};
	}, [ actionHandlers ] );

	useEffect( () => {
		store.dispatch( actions.ui.enableKeyboardShortcuts() );
	}, [] );

	useEffect( () => {
		const handleError = ( event: ErrorEvent ) => {
			logError( event.error ?? event.message );
		};
		const handleRejection = ( event: PromiseRejectionEvent ) => {
			logError( event.reason );
		};

		window.addEventListener( 'error', handleError );
		window.addEventListener( 'unhandledrejection', handleRejection );
		return () => {
			window.removeEventListener( 'error', handleError );
			window.removeEventListener( 'unhandledrejection', handleRejection );
		};
	}, [] );

	useEffect( () => {
		const stopEvent = ( event: KeyboardEvent ) => {
			event.stopPropagation();
			event.preventDefault();
		};

		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( ! getKeyboardShortcutsEnabled( store.getState() ) ) {
				return;
			}
			if ( modifierKeyIsActive( event ) ) {
				return;
			}
			switch ( event.key ) {
				case 'n':
					stopEvent( event );
					store.dispatch( actions.ui.closePanel() );
					break;
				case 'i':
					stopEvent( event );
					store.dispatch( actions.ui.toggleShortcutsPopover() );
					break;
			}
		};

		window.addEventListener( 'keydown', handleKeyDown, false );
		return () => {
			window.removeEventListener( 'keydown', handleKeyDown, false );
		};
	}, [] );

	if ( ! isReady ) {
		return null;
	}

	return (
		<ErrorBoundary>
			<Provider store={ store }>
				<AppProvider
					client={ getClient() }
					locale={ locale }
					isViewSettingsEnabled={ isViewSettingsEnabled }
				>
					<NotificationContent isDismissible={ isDismissible } />
				</AppProvider>
			</Provider>
		</ErrorBoundary>
	);
};

export default NotificationApp;
