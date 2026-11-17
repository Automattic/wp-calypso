import RestClient from '../panel/rest-client';
import { init as initAPI } from '../panel/rest-client/wpcom';
import { store } from '../panel/state';
import { SET_IS_SHOWING } from '../panel/state/action-types';
import { addListeners, removeListeners } from '../panel/state/create-listener-middleware';

let client: any;

export type ClientOptions = { includeNoteContext?: boolean };

export function initClient( wpcom: any, options: ClientOptions = {} ) {
	initAPI( wpcom );

	if ( ! client ) {
		client = new RestClient( options );
		client.setVisibility( { isShowing: false, isVisible: ! document.hidden } );
		document.addEventListener( 'visibilitychange', () => {
			client.setVisibility( { isShowing: client.isShowing, isVisible: ! document.hidden } );
			if ( ! document.hidden ) {
				client.refreshNotes();
			}
		} );
	}
}

export function getClient() {
	return client;
}

let surfacesShowingNotes = 0;

function setIsShowing( isShowing: boolean ) {
	store.dispatch( { type: SET_IS_SHOWING, isShowing } );
	client?.setVisibility( { isShowing, isVisible: ! document.hidden } );
}

/**
 * Marks the notes as on screen until the returned function is called.
 *
 * The panel and the inbox can be mounted at the same time for a moment, in either order, so the
 * notes stay "showing" until the last of them is gone.
 */
export function showNotes(): () => void {
	surfacesShowingNotes++;
	setIsShowing( true );

	return () => {
		surfacesShowingNotes--;
		if ( surfacesShowingNotes === 0 ) {
			setIsShowing( false );
		}
	};
}

type SubscriberNotification = {
	targetSiteId: number;
	receivedAt: number;
	type: 'follow';
	wasVisibleAtReceipt: boolean;
};

export function subscribeUnseenCount(
	wpcom: any,
	onCount: ( count: number ) => void,
	onSubscriberNotification?: ( notification: SubscriberNotification ) => void | Promise< void >,
	options: ClientOptions = {}
): () => void {
	initClient( wpcom, options );

	const handlers = {
		APP_RENDER_NOTES: [
			( _store: unknown, action: unknown ) => {
				const { newNoteCount, subscriberNotifications } = action as {
					newNoteCount: number;
					subscriberNotifications?: SubscriberNotification[];
				};
				onCount( newNoteCount );
				subscriberNotifications?.forEach( ( notification ) => {
					if (
						notification.type === 'follow' &&
						typeof notification.wasVisibleAtReceipt === 'boolean' &&
						Number.isSafeInteger( notification.targetSiteId ) &&
						notification.targetSiteId > 0 &&
						Number.isSafeInteger( notification.receivedAt )
					) {
						void onSubscriberNotification?.( notification );
					}
				} );
			},
		],
	};

	store.dispatch( addListeners( handlers ) );

	return () => store.dispatch( removeListeners( handlers ) );
}
