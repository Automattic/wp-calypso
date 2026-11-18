const { app, session } = require( 'electron' );
const log = require( '../../lib/logger' )( 'desktop:cookie-flush' );

// Never hold up quitting for longer than this, even if the flush stalls.
const FLUSH_TIMEOUT_MS = 2000;

/**
 * Chromium writes cookies to disk lazily, so a cookie set shortly before quitting
 * (e.g. the login cookie) can be lost. Defer the first `before-quit` until the
 * cookie store has been flushed, then resume quitting.
 */
module.exports = function () {
	let flushing = false;
	let resumingQuit = false;

	app.on( 'before-quit', ( event ) => {
		if ( resumingQuit ) {
			resumingQuit = false;
			return;
		}

		event.preventDefault();

		if ( flushing ) {
			return;
		}
		flushing = true;

		log.info( 'Writing cookies to disk before quitting...' );

		let flush;
		try {
			flush = session.defaultSession.cookies.flushStore();
		} catch ( error ) {
			flush = Promise.reject( error );
		}

		let timer;
		const timeout = new Promise( ( resolve ) => {
			timer = setTimeout( () => resolve( 'timeout' ), FLUSH_TIMEOUT_MS );
		} );

		Promise.race( [ flush, timeout ] )
			.then( ( result ) => {
				if ( result === 'timeout' ) {
					log.warn( `Cookie flush did not finish within ${ FLUSH_TIMEOUT_MS }ms, quitting anyway` );
				} else {
					log.info( 'Cookies written to disk' );
				}
			} )
			.catch( ( error ) => {
				log.error( 'Failed to write cookies to disk: ', error );
			} )
			.finally( () => {
				clearTimeout( timer );
				flushing = false;
				resumingQuit = true;
				app.quit();
			} );
	} );
};
