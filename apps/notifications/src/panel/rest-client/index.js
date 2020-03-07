import { store } from '../state';
import actions from '../state/actions';

import getNote from '../state/selectors/get-note';
import getAllNotes from '../state/selectors/get-all-notes';
import simperium from '../simperium';

export function Client() {
	this.isVisible = false;
	this.isShowing = false;
	this.lastSeenTime = null;
	this.hasIndexed = false;
	this.initialAnnouncement = null;

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

			this.ready();
		} );

		notifications.on( 'index', async () => {
			this.hasIndexed = true;
			store.dispatch( actions.ui.loadedNotes() );

			const notes = await notifications.find();
			store.dispatch( actions.notes.addNotes( notes.map( note => note.data ) ) );

			this.ready();
		} );

		notifications.on( 'update', ( id, notification ) => {
			store.dispatch( actions.notes.addNotes( [ notification ] ) );

			this.ready( true );
		} );

		notifications.on( 'remove', id => {
			store.dispatch( actions.notes.removeNotes( [ id ] ) );

			this.ready();
		} );
	} );
}

Client.prototype.readNote = function( noteId ) {
	const note = getNote( store.getState(), noteId );

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
Client.prototype.ready = function ready( hasNewNote = false ) {
	if ( null === this.lastSeenTime || ! this.hasIndexed ) {
		clearTimeout( this.initialAnnouncement );
		this.initialAnnouncement = setTimeout( () => this.ready(), 50 );
		return;
	}

	const notes = getAllNotes( store.getState() );
	const timestamps = notes.map( note => Date.parse( note.timestamp ) / 1000 );
	const newNoteCount = timestamps.filter( time => time > this.lastSeenTime ).length;
	const latestType = notes.length ? notes.slice( -1 )[ 0 ].type : null;

	store.dispatch( {
		type: 'APP_RENDER_NOTES',
		hasNewNote: this.hasIndexed && hasNewNote,
		newNoteCount,
		latestType,
	} );
};

export default Client;
