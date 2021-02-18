/**
 * External dependencies
 */
import { debounce } from 'lodash';
import { registerTranslateHook } from 'i18n-calypso';
import cookie from 'cookie';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { recordOriginals, encodeOriginalKey } from './glotpress';

const debug = debugFactory( 'calypso:translation-scanner' );

export class TranslationScanner {
	constructor( install = true ) {
		Object.assign( this, {
			installed: false,
			active: false,
			pendingOriginals: {},
			sessionId: null,
			cookieWatcherInterval: null,
			previousCookies: null,
		} );

		install && this.install();
	}

	translationFilter( ...args ) {
		const [ translation, options ] = args;
		if ( this.active && this.sessionId ) {
			this.recordOriginal( options.original, options.context || '' );
		}

		return translation;
	}

	install() {
		// Watch for cookies changed through browser magic
		// We could potentially run the filter server-side by pinging the server
		// for the cookie instead of asking the browser.
		if ( ! this.installed && typeof document !== 'undefined' ) {
			debug( 'Installing Translation Scanner' );
			registerTranslateHook( this.translationFilter.bind( this ) );
			this.cookieWatcherInterval = setInterval( this.checkCookie.bind( this ), 1000 );
			this.installed = true;
			this.checkCookie();
		}

		return this;
	}

	uninstall() {
		debug( 'stopping cookie watcher' );
		clearInterval( this.cookieWatcherInterval );
		this.cookieWatcherInterval = null;
		// TODO:
		// unregisterTranslateHook( this.translationFilter );
		this.installed = false;
		return this;
	}

	checkCookie() {
		// client-side rendering only
		if ( typeof document === 'undefined' ) {
			debug( 'no document in checkCookie' );
			return;
		}

		if ( this.previousCookies === document.cookies ) {
			return;
		}

		const newSessionId = cookie.parse( document.cookie )[ 'gp-record' ];
		if ( newSessionId !== this.sessionId ) {
			debug( 'New session Id:', newSessionId );
			this.setSessionId( newSessionId );
		}
	}

	recordOriginal( original, context = '' ) {
		this.pendingOriginals[ encodeOriginalKey( { original, context } ) ] = true;
		this.sendPendingOriginals();
	}

	_sendPendingOriginalsImmediately() {
		const keys = Object.keys( this.pendingOriginals );
		if ( keys.length ) {
			debug( `Sending ${ keys.length } originals to GP_Record` );
			recordOriginals( keys );
			this.pendingOriginals = {};
		}
	}

	sendPendingOriginals = debounce( this._sendPendingOriginalsImmediately.bind( this ), 500, {
		maxWait: 500,
	} );

	setSessionId( newSessionId ) {
		this.sessionId = newSessionId;

		newSessionId ? this.start() : this.stop();
	}

	start() {
		debug( 'Translation Scanner started' );
		this.clear();
		this.active = true;
		return this;
	}

	stop() {
		debug( 'Translation Scanner stopped' );
		this.active = false;
		return this;
	}

	clear() {
		this.pendingOriginals = {};
		return this;
	}
}
