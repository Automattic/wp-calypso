import RestClient from '../panel/rest-client';
import { init as initAPI, setIncludePostDetails } from '../panel/rest-client/wpcom';
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

/**
 * Starts the client ahead of the panel to keep the unseen count fresh. A host that
 * shows the simplified note passes `includePostDetails`, so the notes loaded now
 * already carry what the panel will show.
 */
export function subscribeUnseenCount(
	wpcom: any,
	onCount: ( count: number ) => void,
	{ includePostDetails = false }: { includePostDetails?: boolean } = {}
): () => void {
	setIncludePostDetails( includePostDetails );
	initClient( wpcom );

	const handlers = {
		APP_RENDER_NOTES: [
			( _store: unknown, action: unknown ) =>
				onCount( ( action as { newNoteCount: number } ).newNoteCount ),
		],
	};

	store.dispatch( addListeners( handlers ) );

	return () => store.dispatch( removeListeners( handlers ) );
}
