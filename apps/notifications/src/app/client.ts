import RestClient from '../panel/rest-client';
import { init as initAPI } from '../panel/rest-client/wpcom';
import { store } from '../panel/state';
import { addListeners, removeListeners } from '../panel/state/create-listener-middleware';

let client: any;

export type ClientOptions = {
	/** Ask for post and parent-comment details, which only the simplified note shows. */
	includePostDetails?: boolean;
};

// There is one client per page, so whichever caller starts it sets its options.
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

/**
 * Starts the client ahead of the panel to keep the unseen count fresh, so it takes
 * the same options the panel would pass.
 */
export function subscribeUnseenCount(
	wpcom: any,
	onCount: ( count: number ) => void,
	options: ClientOptions = {}
): () => void {
	initClient( wpcom, options );

	const handlers = {
		APP_RENDER_NOTES: [
			( _store: unknown, action: unknown ) =>
				onCount( ( action as { newNoteCount: number } ).newNoteCount ),
		],
	};

	store.dispatch( addListeners( handlers ) );

	return () => store.dispatch( removeListeners( handlers ) );
}
