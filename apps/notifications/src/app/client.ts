import RestClient from '../panel/rest-client';
import { init as initAPI } from '../panel/rest-client/wpcom';
import { store } from '../panel/state';
import { addListeners, removeListeners } from '../panel/state/create-listener-middleware';

let client: any;

export function initClient( wpcom: any ) {
	initAPI( wpcom );

	if ( ! client ) {
		client = new RestClient();
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

type SubscriberNotification = {
	targetSiteId: number;
	receivedAt: number;
	type: 'follow';
	wasVisibleAtReceipt: boolean;
};

export function subscribeUnseenCount(
	wpcom: any,
	onCount: ( count: number ) => void,
	onSubscriberNotification?: ( notification: SubscriberNotification ) => void | Promise< void >
): () => void {
	initClient( wpcom );

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
