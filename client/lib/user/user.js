/**
 * External dependencies
 */
import { isEqual } from 'lodash';
var store = require( 'store' ),
	debug = require( 'debug' )( 'calypso:user' ),
	config = require( 'config' ),
	qs = require( 'qs' );

/**
 * Internal dependencies
 */
import { isSupportUserSession, boot as supportUserBoot } from 'lib/user/support-user-interop';
var wpcom = require( 'lib/wp' ),
	Emitter = require( 'lib/mixins/emitter' ),
	userUtils = require( './shared-utils' ),
	localforage = require( 'lib/localforage' );

/**
 * User component
 */
function User() {
	if ( ! ( this instanceof User ) ) {
		return new User();
	}

	this.initialize();
}

/**
 * Constants
 */
const VERIFICATION_POLL_INTERVAL = 15000;

/**
 * Mixins
 */
Emitter( User.prototype );

/**
 * Initialize the user data depending on the configuration
 **/
User.prototype.initialize = function() {
	debug( 'Initializing User' );
	this.fetching = false;

	this.on( 'change', this.checkVerification.bind( this ) );

	if ( isSupportUserSession() ) {
		this.data = false;

		supportUserBoot();
		this.fetch();

		// We're booting into support user mode, skip initialization of the main user.
	} else {
		this.data = {};
	}
};


/**
 * Clear localStorage when we detect that there is a mismatch between the ID
 * of the user stored in localStorage and the current user ID
 **/
User.prototype.clearStoreIfChanged = function( userId ) {
	var storedUser = store.get( 'wpcom_user' );

	if ( storedUser && storedUser.ID !== userId ) {
		debug( 'Clearing localStorage because user changed' );
		store.clear();
	}
};

/**
 * Get user data
 */
User.prototype.get = function() {
	return this.data;
};

User.prototype.getLanguage = function() {
	var languages = config( 'languages' ),
		len = languages.length,
		language,
		index;

	if ( ! this.data.localeSlug ) {
		return;
	}
	for ( index = 0; index < len; index++ ) {
		if ( this.data.localeSlug === languages[ index ].langSlug ) {
			language = languages[ index ];
			break;
		}
	}

	return language;

};

/**
 * Get the URL for a user's avatar (from Gravatar). Uses
 * the short-form query string parameters as options,
 * sets some sane defaults.
 * @param {Object} options Options per https://secure.gravatar.com/site/implement/images/
 */
User.prototype.getAvatarUrl = function( options ) {
	var default_options = {
			s: 80,
			d: 'mm',
			r: 'G'
		},
		avatar_URL = this.get().avatar_URL,
		avatar = ( typeof avatar_URL === 'string' ) ? avatar_URL.split( '?' )[ 0 ] : '';

	options = options || {};
	options = Object.assign( {}, options, default_options );

	return avatar + '?' + qs.stringify( options );
};

User.prototype.isRTL = function() {
	var isRTL = false,
		language = this.getLanguage();

	if ( language && language.rtl ) {
		isRTL = true;
	}

	return isRTL;
};

/**
 * Clear any user data.
 *
 * @param {function}  onClear called when data has been cleared
 */
User.prototype.clear = function( onClear ) {
	/**
	 * Clear internal user data and empty localStorage cache
	 * to discard any user reference that the application may hold
	 */
	this.data = [];
	delete this.settings;
	store.clear();
	if ( config.isEnabled( 'persist-redux' ) ) {
		localforage.clear( onClear );
	}
};

/**
 * Sends the user an email with a link to verify their account if they
 * are unverified.
 */
User.prototype.sendVerificationEmail = function( fn ) {
	return wpcom.undocumented().me().sendVerificationEmail( fn );
};

User.prototype.set = function( attributes ) {
	var changed = false,
		computedAttributes = userUtils.getComputedAttributes( attributes );

	this.initialized = true;
	this.data = this.data || {};
	attributes = Object.assign( {}, attributes, computedAttributes );

	for ( var prop in attributes ) {
		if ( attributes.hasOwnProperty( prop ) && ! isEqual( attributes[ prop ], this.data[ prop ] ) ) {
			this.data[ prop ] = attributes[ prop ];
			changed = true;
		}
	}

	if ( changed ) {
		this.emit( 'change' );
		store.set( 'wpcom_user', this.data );
	}

	return changed;
};

/**
 * Called every VERIFICATION_POLL_INTERVAL milliseconds
 * if the email is not verified.
 *
 * May also be called by a localStorage event, on which case
 * the `signal` parameter is set to true.
 *
 * @private
 */

User.prototype.verificationPollerCallback = function( signal ) {
	// skip server poll if page is hidden or there are no listeners
	// and this was not triggered by a localStorage signal
	if ( ( document.hidden || this.listeners( 'verify' ).length === 0 ) && !signal ) {
		return;
	}

	debug( 'Verification: POLL' );

	this.once( 'change', () => {
		if ( this.get().email_verified ) {
			// email is verified, stop polling
			clearInterval( this.verificationPoller );
			this.verificationPoller = null;
			debug( 'Verification: VERIFIED' );
			this.emit( 'verify' );
		}
	} );

	this.fetch();
};

/**
 * Checks if the user email is verified, and starts polling
 * for verification if that's not the case.
 *
 * Also registers a listener to localStorage events.
 *
 * @private
 */

User.prototype.checkVerification = function() {
	if ( !this.get() ) {
		// not loaded, do nothing
		return;
	}

	if ( this.get().email_verified ) {
		// email already verified, do nothing
		return;
	}

	if ( this.verificationPoller ) {
		// already polling, do nothing
		return;
	}

	this.verificationPoller = setInterval( this.verificationPollerCallback.bind( this ), VERIFICATION_POLL_INTERVAL );

	// wait for localStorage event (from other windows)
	window.addEventListener( 'storage', ( e ) => {
		if ( e.key === '__email_verified_signal__' && e.newValue ) {
			debug( 'Verification: RECEIVED SIGNAL' );
			window.localStorage.removeItem( '__email_verified_signal__' );
			this.verificationPollerCallback( true );
		}
	} );
};

/**
 * Writes to local storage, signalling all other windows
 * that the user has been verified.
 *
 * This should be called from the verification successful
 * message, so that all the windows update instantaneously
 */

User.prototype.signalVerification = function() {
	if ( window.localStorage ) {
		// use localStorage to signal to other browser windows that the user's email was verified
		window.localStorage.setItem( '__email_verified_signal__', 1 );
		debug( 'Verification: SENT SIGNAL' );
	}
};

/**
 * Expose `User`
 */
module.exports = User;
