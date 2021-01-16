/**
 * External Dependencies
 */
const EventEmitter = require( 'events' ).EventEmitter;

/**
 * Internal Dependencies
 */
const log = require( '../../lib/logger' )( 'desktop:session' );

/*
 * Module constants
 */

class SessionManager extends EventEmitter {
	constructor() {
		super();
	}

	async init( window ) {
		log.info( 'Initializing session manager...' );

		this.loggedIn = false;
		this.window = window;

		// check for existing auth
		const wordpress_logged_in = await getAuthCookie( window );
		if ( wordpress_logged_in ) {
			log.info( `Got 'wordpress_logged_in' cookie, emitting 'logged-in' event...` );

			this.loggedIn = true;
			this.emit( 'logged-in', wordpress_logged_in );
			log.info( `Logged in with cookie 'wordpress_logged_in': `, wordpress_logged_in );
		}

		this.window.webContents.session.cookies.on( 'changed', ( _, cookie, reason, removed ) => {
			if ( cookie.name === 'wordpress_logged_in' && cookie.domain === '.wordpress.com' ) {
				if ( removed ) {
					log.info( `'wordpress_logged_in' cookie was removed, emitting 'logged-out' event...` );

					if ( this.loggedIn ) {
						this.loggedIn = false;
						this.emit( 'logged-out' );
					}
				} else {
					log.info( `Got 'wordpress_logged_in' cookie, emitting 'logged-in' event...` );

					this.loggedIn = true;

					this.emit( 'logged-in', { wordpress_logged_in: wordpress_logged_in } );
					log.debug( `Logged in with cookie 'wordpress_logged_in': `, wordpress_logged_in );
				}
			}
		} );
	}

	isLoggedIn() {
		return this.loggedIn;
	}
}

async function getAuthCookie( window ) {
	let cookies = await window.webContents.session.cookies.get( {
		url: 'https://public-api.wordpress.com',
		name: 'wordpress_logged_in',
	} );
	if ( cookies ) {
		if ( ! Array.isArray( cookies ) ) {
			cookies = [ cookies ];
		}
		return cookies[ 0 ];
	}
	return null;
}

module.exports = new SessionManager();
