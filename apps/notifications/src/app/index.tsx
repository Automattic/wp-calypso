import { __experimentalHStack as HStack } from '@wordpress/components';
import clsx from 'clsx';
import { useEffect, useState, type TransitionEvent } from 'react';
import { Provider } from 'react-redux';
import repliesCache from '../panel/comment-replies-cache';
import { modifierKeyIsActive } from '../panel/helpers/input';
import RestClient from '../panel/rest-client';
import { init as initAPI } from '../panel/rest-client/wpcom';
import { init as initStore } from '../panel/state';
import { SET_IS_SHOWING } from '../panel/state/action-types';
import actions from '../panel/state/actions';
import { addListeners, removeListeners } from '../panel/state/create-listener-middleware';
import getIsPanelOpen from '../panel/state/selectors/get-is-panel-open';
import getKeyboardShortcutsEnabled from '../panel/state/selectors/get-keyboard-shortcuts-enabled';
import { AppProvider } from './context';
import Note from './note';
import { useNoteNavigationViaKeyboardShortcuts } from './note/hooks';
import NotePanel from './note-panel';
import type { FilterName } from './types';

import './style.scss';

let client: any;

let store = initStore();

repliesCache.cleanup();

/**
 * Force a manual refresh of the notes data
 */
export const refreshNotes = () => client && client.refreshNotes.call( client );

const defaultHandlers = {
	APP_REFRESH_NOTES: [
		( _store: any, action: any ) => {
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

	useNoteNavigationViaKeyboardShortcuts( { filterName, selectedNoteId, setSelectedNoteId } );

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
				<Note
					isDismissible={ isDismissible }
					noteId={ displayedNoteId }
					setSelectedNoteId={ setSelectedNoteId }
				/>
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
	customEnhancer,
	actionHandlers = {},
	wpcom,
}: {
	locale?: string;
	isDismissible?: boolean;
	customEnhancer?: any;
	actionHandlers?: any;
	wpcom: any;
} ) => {
	const [ isReady, setIsReady ] = useState( !! client );

	useEffect( () => {
		store.dispatch( { type: 'APP_IS_READY' } );
		store.dispatch( { type: SET_IS_SHOWING, isShowing: true } );
		client?.setVisibility( { isShowing: true, isVisible: true } );

		return () => {
			store.dispatch( { type: SET_IS_SHOWING, isShowing: false } );
			client?.setVisibility( { isShowing: false, isVisible: false } );
		};
	}, [] );

	useEffect( () => {
		initAPI( wpcom );

		if ( ! client ) {
			client = new RestClient();
			client.locale = locale;
			client?.setVisibility( { isShowing: true, isVisible: true } );
			setIsReady( true );
		}
	}, [ wpcom ] );

	useEffect( () => {
		if ( customEnhancer ) {
			store = initStore( { customEnhancer } );
		}
	}, [ customEnhancer ] );

	useEffect( () => {
		if ( client ) {
			client.locale = locale;
		}
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
		<Provider store={ store }>
			<AppProvider client={ client } locale={ locale }>
				<NotificationContent isDismissible={ isDismissible } />
			</AppProvider>
		</Provider>
	);
};

export default NotificationApp;
