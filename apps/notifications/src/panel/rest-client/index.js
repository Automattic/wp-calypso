/**
 * Module dependencies.
 */
import { difference, get, pick, property, range } from 'lodash';

import { store } from '../state';
import actions from '../state/actions';

import getAllNotes from '../state/selectors/get-all-notes';

import repliesCache from '../comment-replies-cache';

import { fetchNote, listNotes, sendLastSeenTime, subscribeToNoteStream } from './wpcom';

const debug = require( 'debug' )( 'notifications:rest-client' );

const settings = {
	max_refresh_ms: 180000,
	refresh_ms: 30000,
	initial_limit: 10,
	increment_limit: 10,
	max_limit: 100,
};

export function Client() {
	this.noteList = [];
	this.gettingNotes = false;
	this.timeout = false;
	this.isVisible = false;
	this.isShowing = false;
	this.lastSeenTime = 0;
	this.hasNewNoteData = false;
	this.noteRequestLimit = settings.initial_limit;
	this.retries = 0;
	this.subscribeTry = 0;
	this.subscribeTries = 3;
	this.subscribing = false;
	this.subscribed = false;
	this.firstRender = true;
	this.inbox = [];

	window.addEventListener( 'storage', handleStorageEvent.bind( this ) );

	this.main( this );
}

function main() {
	// subscribe if possible
	if ( ! this.subscribed && ! this.subscribing ) {
		if ( this.subscribeTry < this.subscribeTries ) {
			debug( 'main: trying to subscribe' );
			this.subscribing = true;
			subscribeToNoteStream( pinghubCallback.bind( this ) );
		} else if ( this.subscribeTry === this.subscribeTries ) {
			const sub_retry_ms = 120000;
			debug( 'main: polling until next subscribe attempt', 'sub_retry_ms =', sub_retry_ms );
			setTimeout(
				function () {
					this.subscribeTry = 0;
				}.bind( this ),
				sub_retry_ms
			);
		}
		this.subscribeTry++;
	}

	// subscribers call main() when the subscription delivers a message
	const notes = getAllNotes( store.getState() );
	if ( notes.length && this.subscribed && ! this.inbox.length ) {
		return debug( 'main: subscribed, no new messages; sleeping' );
	}

	// schedule the next call to main()
	this.reschedule();

	// nobody's looking. take a nap until they return.
	if ( ! this.isVisible ) {
		return debug( 'main: not visible. sleeping.' );
	}

	if ( this.inbox.length === 1 && this.inbox[ 0 ].action && this.inbox[ 0 ].action === 'push' ) {
		const note_id = this.inbox[ 0 ].note_id;
		debug( 'main: have one push message with note_id, calling getNote(%d)', note_id, this.inbox );
		this.inbox = [];
		this.getNote( note_id );
	} else if ( this.inbox.length ) {
		debug( 'main: have messages, calling getNotes', this.inbox );
		this.inbox = [];
		this.getNotes();
	} else if ( ! notes.length ) {
		debug( 'main: no notes in local cache, calling getNotes' );
		this.getNotes();
	} else {
		debug( 'main: polling, have notes in local cache, calling getNotesList' );
		this.getNotesList();
	}
}

function reschedule( refresh_ms ) {
	if ( ! refresh_ms ) {
		refresh_ms = settings.refresh_ms;
	}
	if ( this.timeout ) {
		clearTimeout( this.timeout );
		this.timeout = false;
	}
	if ( this.subscribed ) {
		debug( 'reschedule', 'subscribed; not polling' );
	} else {
		debug( 'reschedule', 'refresh_ms =', refresh_ms );
		this.timeout = setTimeout( main.bind( this ), refresh_ms );
	}
}

function pinghubCallback( err, event ) {
	const responseType = get( event, 'response.type' );

	this.subscribing = false;

	// WebSocket error: costs one try
	if ( err || ! responseType || responseType === 'error' ) {
		debug( 'pinghubCallback: error', 'err =', err );
		this.subscribed = false;
	} else if ( responseType === 'open' ) {
		// WebSocket connected: stop polling
		debug( 'pinghubCallback: connected', event.response );
		this.subscribeTry = 0;
		this.subscribed = true;
	} else if ( responseType === 'close' ) {
		// WebSocket disconnected: have another try
		debug( 'pinghubCallback: disconnected', event.response );
		this.subscribeTry = 0;
		this.subscribed = false;
	} else if ( responseType === 'message' ) {
		// WebSocket message: add to inbox, call main() to trigger API call
		let message = true;
		try {
			message = JSON.parse( get( event, 'response.data' ) );
		} catch ( e ) {}
		this.inbox.push( message );
		debug( 'pinghubCallback: received message', event.response, 'this.inbox =', this.inbox );
		this.main();
	} else {
		// Missed case?
		debug( 'pinghubCallback: unknown event.response.type', event.response );
		throw new Error(
			'notifications:rest-client:pinghubCallback unknown event.response.type: ' + responseType
		);
	}

	this.reschedule();
}

function getNote( note_id ) {
	// initialize the list if it's empty
	if ( this.noteList.length === 0 ) {
		this.getNotes();
	}

	const parameters = {
		fields: 'id,type,unread,body,subject,timestamp,meta,note_hash',
	};

	fetchNote( note_id, parameters, ( error, data ) => {
		if ( error ) {
			return;
		}
		store.dispatch( actions.notes.addNotes( data.notes ) );
		ready.call( this );
	} );
}

function getNotes() {
	if ( this.gettingNotes ) {
		return;
	}
	this.gettingNotes = true;

	const parameters = {
		fields: 'id,type,unread,body,subject,timestamp,meta,note_hash',
		number: this.noteRequestLimit,
	};

	const notes = getAllNotes( store.getState() );
	if ( ! notes.length || this.noteRequestLimit > notes.length ) {
		store.dispatch( actions.ui.loadNotes() );
	}

	listNotes( parameters, ( error, data ) => {
		this.gettingNotes = false;
		if ( error ) {
			/*
			 * Something failed, so try again and
			 * reset the local noteList copy. We
			 * might have optimistically modified
			 * it when we last compared it to the
			 * server, but there's been a failure
			 * here so resetting it will force a
			 * full refresh.
			 */
			this.retries = this.retries + 1;
			const backoff_ms = Math.min(
				settings.refresh_ms * ( this.retries + 1 ),
				settings.max_refresh_ms
			);
			debug( 'getNotes error, using backoff_ms=%d', backoff_ms );
			this.noteList = [];
			this.reschedule( backoff_ms );
			return;
		}

		store.dispatch( actions.ui.loadedNotes() );

		const oldNotes = getAllNotes( store.getState() ).map( property( 'id' ) );
		const newNotes = data.notes.map( property( 'id' ) );
		const notesToRemove = difference( oldNotes, newNotes );

		notesToRemove.length && store.dispatch( actions.notes.removeNotes( notesToRemove ) );
		store.dispatch( actions.notes.addNotes( data.notes ) );

		// Store id/hash pairs for now until properly reduxified
		// this is used as a network optimization to quickly determine
		// changes without downloading all the data
		this.noteList = data.notes.map( ( note ) => pick( note, [ 'id', 'note_hash' ] ) );

		this.updateLastSeenTime( Number( data.last_seen_time ) );
		if ( parameters.number === settings.max_limit ) {
			/*
			 * Since we store note data in a local cache,
			 * we want to purge the data if the notes
			 * no longer exist, but we only want to do it
			 * if we have loaded all the notes, otherwise
			 * we might expunge legitimate entries that
			 * simply haven't been loaded yet.
			 */
			cleanupLocalCache.call( this );
		}
		this.retries = 0;
		ready.call( this );
	} );
}

function getNotesList() {
	const notes = getAllNotes( store.getState() );
	// make sure we have some notes before we run this
	if ( ! notes.length ) {
		return;
	}

	if ( this.gettingNotes ) {
		return;
	}
	this.gettingNotes = true;

	const parameters = {
		fields: 'id,note_hash',
		number: this.noteRequestLimit,
	};

	listNotes( parameters, ( error, data ) => {
		debug( 'getNotesList callback:', error, data );
		this.gettingNotes = false;
		if ( error ) {
			this.retries = this.retries + 1;
			const backoff_ms = Math.min(
				settings.refresh_ms * ( this.retries + 1 ),
				settings.max_refresh_ms
			);
			debug( 'getNotesList error, using backoff_ms=%d', backoff_ms );
			return this.reschedule( backoff_ms );
		}

		this.retries = 0;

		/* Compare list of notes from server to local copy */
		const newerNoteList = data.notes.map( property( 'id' ) );
		const localNoteList = this.noteList.map( property( 'id' ) );
		const notesToRemove = difference( localNoteList, newerNoteList );

		this.hasNewNoteData = difference( newerNoteList, localNoteList ).length;

		const serverHasChanges =
			this.hasNewNoteData ||
			difference(
				data.notes.map( property( 'note_hash' ) ),
				this.noteList.map( property( 'note_hash' ) )
			).length > 0;

		/* Actually remove the notes from the local copy */
		if ( notesToRemove.length ) {
			store.dispatch( actions.notes.removeNotes( notesToRemove ) );
		}

		/* Update our local copy of the note list */
		this.noteList = data.notes;
		this.updateLastSeenTime( Number( data.last_seen_time ) );

		// Clean out stored reply texts that are older than a day
		repliesCache.cleanup();

		/* Grab updates/changes from server if they exist */
		return serverHasChanges ? this.getNotes() : ready.call( this );
	} );
}

/**
 * Reports new notification data if available
 *
 * New notification data is available _if_ we
 * have a note with a timestamp newer than we
 * did the last time we called this function.
 */
function ready() {
	const notes = getAllNotes( store.getState() );

	const timestamps = notes
		.map( property( 'timestamp' ) )
		.map( ( timestamp ) => Date.parse( timestamp ) / 1000 );

	let newNoteCount = timestamps.filter( ( time ) => time > this.lastSeenTime ).length;

	if ( ! this.firstRender && this.lastSeenTime === 0 ) {
		newNoteCount = 0;
	}

	const latestType = get( notes.slice( -1 )[ 0 ], 'type', null );
	store.dispatch( { type: 'APP_RENDER_NOTES', newNoteCount, latestType } );

	this.hasNewNoteData = false;
	this.firstRender = false;
}

/** @type {RegExp} matches keys which may no longer need to exist */
const obsoleteKeyPattern = /^(note_read_status|reply)_(\d+)/;

const safelyRemoveKey = ( key ) => {
	try {
		localStorage.removeItem( key );
	} catch ( e ) {}
};

const getLocalKeys = () => {
	try {
		return range( localStorage.length ).map( ( index ) => localStorage.key( index ) );
	} catch ( e ) {
		return [];
	}
};

function cleanupLocalCache() {
	const notes = getAllNotes( store.getState() );
	const currentNoteIds = notes.map( property( 'id' ) );

	getLocalKeys()
		.map( ( key ) => obsoleteKeyPattern.exec( key ) )
		.filter( ( match ) => match && ! currentNoteIds.includes( match[ 1 ] ) )
		.forEach( safelyRemoveKey );
}

/**
 * Update lastSeenTime in object instance, localStorage, and remote database.
 * Advance this.lastSeenTime to proposedTime or the latest visible note time.
 * If the timestamp comes from a note, update the remote database.
 *
 * @param {number} proposedTime A proposed update to our lastSeenTime timestamp
 * @param {boolean} fromStorage Whether this call is from handleStorageEvent
 * @returns {boolean} whether or not we will update our lastSeenTime value
 */
function updateLastSeenTime( proposedTime, fromStorage ) {
	let fromNote = false;
	let mostRecentNoteTime = 0;

	// Make sure we aren't getting milliseconds
	// The check time is Aug 8, 2005 in ms
	if ( proposedTime > 1123473600000 ) {
		proposedTime = proposedTime / 1000;
	}

	debug( 'updateLastSeenTime 0', {
		proposedTime: proposedTime,
		fromStorage: fromStorage,
		lastSeenTime: this.lastSeenTime,
	} );

	// Event was triggered by another tab's localStorage.setItem; ignore localStorage and remote.
	if ( fromStorage ) {
		if ( proposedTime <= this.lastSeenTime ) {
			return false;
		}
		this.lastSeenTime = proposedTime;
		return true;
	}

	const notes = getAllNotes( store.getState() );
	if ( notes.length ) {
		mostRecentNoteTime = Date.parse( notes[ 0 ].timestamp ) / 1000;
	}

	debug( 'updateLastSeenTime 1', {
		proposedTime: proposedTime,
		showing: this.showing,
		visible: this.visible,
		lastSeenTime: this.lastSeenTime,
		mostRecentNoteTime: mostRecentNoteTime,
	} );

	// Advance proposedTime to the latest visible note time.
	if ( this.isShowing && this.isVisible && mostRecentNoteTime > proposedTime ) {
		proposedTime = mostRecentNoteTime;
		fromNote = true;
	}

	debug( 'updateLastSeenTime 2', {
		proposedTime: proposedTime,
		fromNote: fromNote,
		oldNews: proposedTime <= this.lastSeenTime,
	} );

	// Ignore old news.
	if ( proposedTime <= this.lastSeenTime ) {
		return false;
	}

	this.lastSeenTime = proposedTime;

	try {
		localStorage.setItem( 'notesLastMarkedSeen', this.lastSeenTime );
	} catch ( e ) {}

	// Update the database only if an unseen note has become visible.
	if ( fromNote ) {
		debug( 'updateLastSeenTime 3', this.lastSeenTime );
		sendLastSeenTime( this.lastSeenTime );
	}

	return true;
}

function refreshNotes() {
	if ( this.subscribed ) {
		return;
	}

	getNotesList.call( this );
}

function handleStorageEvent( event ) {
	if ( ! event ) {
		return;
	}

	if ( event.key === 'notesLastMarkedSeen' ) {
		try {
			const lastSeenTime = Number( event.newValue );
			if ( updateLastSeenTime.call( this, lastSeenTime, true ) ) {
				store.dispatch( {
					type: 'APP_RENDER_NOTES',
					newNoteCount: 0,
				} );
			}
		} catch ( e ) {}
		return;
	}

	if ( 'note_read_status_' === event.key.substring( 0, 17 ) ) {
		const noteId = parseInt( event.key.slice( 17 ), 10 );

		return store.dispatch( actions.notes.readNote( noteId ) );
	}
}

function loadMore() {
	const notes = getAllNotes( store.getState() );
	if ( ! notes.length || this.noteRequestLimit > notes.length ) {
		// we're already attempting to load more notes
		return;
	}
	if ( this.noteRequestLimit >= settings.max_limit ) {
		return;
	}
	this.noteRequestLimit = this.noteRequestLimit + settings.increment_limit;
	if ( this.noteRequestLimit > settings.max_limit ) {
		this.noteRequestLimit = settings.max_limit;
	}

	this.getNotes();
}

function setVisibility( { isShowing, isVisible } ) {
	if ( this.isShowing === isShowing && this.isVisible === isVisible ) {
		return;
	}

	this.isShowing = isShowing;
	this.isVisible = isVisible;

	if ( isVisible && isShowing ) {
		this.updateLastSeenTime( 0 );
		this.main();
	}
}

Client.prototype.main = main;
Client.prototype.reschedule = reschedule;
Client.prototype.getNote = getNote;
Client.prototype.getNotes = getNotes;
Client.prototype.getNotesList = getNotesList;
Client.prototype.updateLastSeenTime = updateLastSeenTime;
Client.prototype.loadMore = loadMore;
Client.prototype.refreshNotes = refreshNotes;
Client.prototype.setVisibility = setVisibility;

export default Client;
