import { Navigator } from '@wordpress/components';
import { createContext, useEffect, useState, Suspense, lazy } from 'react';
import { Provider } from 'react-redux';
import repliesCache from '../panel/comment-replies-cache';
import RestClient from '../panel/rest-client';
import { init as initAPI } from '../panel/rest-client/wpcom';
import { init as initStore } from '../panel/state';
import { SET_IS_SHOWING } from '../panel/state/action-types';
import { addListeners, removeListeners } from '../panel/state/create-listener-middleware';
import getIsPanelOpen from '../panel/state/selectors/get-is-panel-open';

let client: any;

let store = initStore();

repliesCache.cleanup();

/**
 * Force a manual refresh of the notes data
 */
export const refreshNotes = () => client && client.refreshNotes.call( client );

export const RestClientContext = createContext( client );

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

const NotePanel = lazy( () => import( './note-panel' ) );

const Note = lazy( () => import( './note' ) );

const NotificationApp = ( {
	locale = 'en',
	customEnhancer,
	actionHandlers = {},
	wpcom,
}: {
	locale?: string;
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

	if ( ! isReady ) {
		return null;
	}

	return (
		<Provider store={ store }>
			<RestClientContext.Provider value={ client }>
				<Navigator initialPath="/">
					<Navigator.Screen path="/">
						<Suspense fallback={ null }>
							<NotePanel />
						</Suspense>
					</Navigator.Screen>
					<Navigator.Screen path="/notes/:noteId">
						<Suspense fallback={ null }>
							<Note />
						</Suspense>
					</Navigator.Screen>
				</Navigator>
			</RestClientContext.Provider>
		</Provider>
	);
};

export default NotificationApp;
