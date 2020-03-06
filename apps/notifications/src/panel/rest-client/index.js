import { store } from '../state';
import actions from '../state/actions';

import getNote from '../state/selectors/get-note';
import getAllNotes from '../state/selectors/get-all-notes';
import simperium from '../simperium';

export function Client() {
	this.isVisible = false;
	this.isShowing = false;
	this.lastSeenTime = 0;

	store.dispatch( actions.ui.loadNotes() );
	simperium().then( ( { meta, notifications } ) => {
		this.meta = meta;
		this.notifications = notifications;

		meta.on( 'index', async () => {
			const data = await meta.find();

			if ( ! data.length || ! data[ 0 ].id === 'meta' ) {
				return;
			}

			this.lastSeenTime = data[ 0 ].last_seen;
		} );

		meta.on( 'update', ( id, data ) => {
			this.lastSeenTime = data.last_seen;
		} );

		notifications.on( 'index', async () => {
			store.dispatch( actions.ui.loadedNotes() );

			const notes = await notifications.find();
			store.dispatch( actions.notes.addNotes( notes.map( note => note.data ) ) );

			ready.call( this );
		} );

		notifications.on( 'update', ( id, notification ) => {
			store.dispatch( actions.notes.addNotes( [ notification ] ) );

			ready.call( this );
		} );

		notifications.on( 'remove', id => {
			store.dispatch( actions.notes.removeNotes( [ id ] ) );

			ready.call( this );
		} );
	} );
}

Client.prototype.readNote = function( noteId ) {
	const note = getNote( store.getState(), noteId );

	console.log( note );

	if ( ! note ) {
		return;
	}

	this.notifications.update( noteId, { ...note, read: 1 } );
};

/**
 * Reports new notification data if available
 *
 * New notification data is available _if_ we
 * have a note with a timestamp newer than we
 * did the last time we called this function.
 */
function ready() {
	const notes = getAllNotes( store.getState() );
	const timestamps = notes.map( note => Date.parse( note.timestamp ) / 1000 );
	const newNoteCount = timestamps.filter( time => time > this.lastSeenTime ).length;
	const latestType = notes.length ? notes.slice( -1 )[ 0 ].type : null;

	store.dispatch( { type: 'APP_RENDER_NOTES', newNoteCount, latestType } );
}

export default Client;
