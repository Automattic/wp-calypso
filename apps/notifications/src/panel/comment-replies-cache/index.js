/**
 * @module comment-replies-cache/index
 */

/**
 * Module dependencies.
 */

const debug = require( 'debug' )( 'notifications:note' );

function getItem( key ) {
	let item;
	try {
		item = window.localStorage.getItem( key );
		return JSON.parse( item );
	} catch ( e ) {
		if ( e instanceof SyntaxError ) {
			return item;
		}

		debug( 'couldnt get localStorage item for: %s', key );
	}

	return null;
}

function setItem( key, value ) {
	try {
		window.localStorage.setItem( key, JSON.stringify( value ) );
	} catch ( e ) {
		debug( 'couldnt set localStorage item for: %s', key );
	}
}

function removeItem( key ) {
	try {
		window.localStorage.removeItem( key );
	} catch ( e ) {
		debug( 'couldnt remove item from localStorage for: %s', key );
	}
}

/**
 * Clears out state persisted reply cache
 *
 * When filling out a reply to a comment,
 * the text is saved in `localStorage` to
 * prevent it from disappearing on accidental
 * page refreshes, browser closes, or navigation.
 * However, we don't want to pre-fill a comment
 * reply if the saved version is older than a
 * certain period of time: in this case, one day.
 */
function cleanup() {
	const keysToRemove = [];

	try {
		for ( let i = 0; i < window.localStorage.length; i++ ) {
			const storedReplyKey = window.localStorage.key( i );

			// cleanup caches replies older than a day
			if ( 'reply_' === window.localStorage.key( i ).substring( 0, 6 ) ) {
				const storedReply = getItem( storedReplyKey );

				if ( storedReply && Date.now() - storedReply[ 1 ] >= 24 * 60 * 60 * 1000 ) {
					keysToRemove.push( storedReplyKey );
				}
			}
		}
	} catch ( e ) {
		debug( 'couldnt cleanup cache' );
	}

	keysToRemove.forEach( removeItem );
}

export default {
	cleanup,
	getItem,
	setItem,
	removeItem,
};
