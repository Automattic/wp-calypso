import { default as createClient } from 'simperium';

import { store } from '../state';
import actions from '../state/actions';
import { wpcom } from '../rest-client/wpcom';

import getNote from '../state/selectors/get-note';
import getAllNotes from '../state/selectors/get-all-notes';

const APP_ID = localStorage.getItem( 'wpnotes_app_id' );

export default class SimperiumClient {
	constructor() {
		this.isVisible = false;
		this.isShowing = false;
		this.lastSeenTime = null;
		this.hasIndexed = false;
		this.initialAnnouncement = true;

		store.dispatch( actions.ui.loadNotes() );
		this.login().then( ( { meta, notifications } ) => {
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

	login = async () => {
		const { token } = await wpcom().req.post( {
			path: '/me/simperium-tokens/new',
			apiVersion: 'v1.1',
			body: {
				api_key: localStorage.getItem( 'wpnotes_api_key' ),
			},
		} );

		const client = createClient( APP_ID, token, {} );

		return {
			meta: client.bucket( 'meta' ),
			notifications: client.bucket( 'note20' ),
		};
	};

	readNote = noteId => {
		const note = getNote( store.getState(), noteId );

		if ( ! note ) {
			return;
		}

		this.notifications.update( noteId, { ...note, read: 1 } );
	};

	ready = ( hasNewNote: boolean ) => {
		if ( null === this.lastSeenTime || ! this.hasIndexed ) {
			clearTimeout( this.initialAnnouncement );
			this.initialAnnouncement = setTimeout( () => this.ready(), 50 );
			return;
		}

		const notes = getAllNotes( store.getState() );
		const timestamps = notes.map( note => Date.parse( note.timestamp ) / 1000 );
		const newNoteCount = timestamps.filter( time => time > this.lastSeenTime ).length;
		const latestType = notes.length ? notes[ notes.length - 1 ].type : null;

		store.dispatch( {
			type: 'APP_RENDER_NOTES',
			hasNewNote: this.hasIndex && hasNewNote,
			newNoteCount,
			latestType,
		} );
	};

	// stubbed for compatability with rest-client
	getNote() {}
	loadMore() {}
	refreshNotes() {}
	setVisibility( { isShowing, isVisible } ) {
		this.isShowing = isShowing;
		this.isVisible = isVisible;
	}
}
