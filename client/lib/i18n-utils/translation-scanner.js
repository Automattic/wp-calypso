/** @format */
/**
 * External dependencies
 */
import { debounce } from 'lodash';
import { registerTranslateHook } from 'i18n-calypso';
import debugFactory from 'debug';
import cookie from 'cookie';

/**
 * Internal dependencies
 */
import config from 'config';
import { recordOriginals, encodeOriginalKey } from './glotpress';

const debug = debugFactory( 'calypso:translation-scanner' );

export class TranslationScanner {
	constructor( install = true ) {
		Object.assign( this, {
			installed: false,
			active: false,
			loggedTranslations: [],
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
		if ( ! config.isEnabled( 'i18n/translation-scanner' ) ) {
			return;
		}

		// Watch for cookies changed through browser magic
		// We could potentially run the filter server-side by pinging the server
		// for the cookie instead of asking the browser.
		if ( typeof document !== 'undefined' ) {
			debug( 'installing Translation Scanner' );
			registerTranslateHook( this.translationFilter.bind( this ) );
			this.cookieWatcherInterval = setInterval( this.checkCookie.bind( this ), 1000 );
			this.installed = true;
		}

		return this.installed;
	}

	uninstall() {
		debug( 'stopping cookie watcher' );
		clearInterval( this.cookieWatcherInterval );
		this.cookieWatcherInterval = null;
		// TODO:
		// unregisterTranslateHook( this.translationFilter );
		// this.installed = false;
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
			recordOriginals( keys, this.sessionId );
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
		if ( ! config.isEnabled( 'i18n/translation-scanner' ) ) {
			return;
		}
		debug( 'Translation Scanner started' );
		if ( ! this.installed ) {
			this.install();
		}
		this.checkCookie();
		this.clear();
		this.active = true;
	}

	stop() {
		debug( 'Translation Scanner stopped' );
		this.active = false;
		return this.loggedTranslations;
	}

	clear() {
		this.loggedTranslations = [];
		return this.loggedTranslations;
	}

	format( translation, options ) {
		const { original, context, plural /*, ...rest*/ } = options;
		return `translation: ${ translation }, original: ${ original }, context: ${ context }, plural: ${ plural }`;
	}

	report( translations = this.loggedTranslations ) {
		translations.map( ( [ translation, options ] ) =>
			// eslint-disable-next-line no-console
			console.log( this.format( translation, options ) )
		);
	}
}
