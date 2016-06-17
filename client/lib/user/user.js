/**
 * Internal dependencies
 */
import { isSupportUserSession, boot as supportUserBoot } from 'lib/user/support-user-interop';

/**
 * External dependencies
 */
var store = require( 'store' ),
	debug = require( 'debug' )( 'calypso:user' ),
	config = require( 'config' ),
	qs = require( 'qs' ),
	isEqual = require( 'lodash/isEqual' );

/**
 * Internal dependencies
 */
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
	this.initialized = false;

	this.on( 'change', this.checkVerification.bind( this ) );

	if ( isSupportUserSession() ) {
		supportUserBoot();
		this.fetch();

		// We're booting into support user mode, skip initialization of the main user.
		return;
	}

	if ( config( 'wpcom_user_bootstrap' ) ) {
		this.data = window.currentUser || false;

		// Store the current user in localStorage so that we can use it to determine
		// if the the logged in user has changed when initializing in the future
		if ( this.data ) {
			this.clearStoreIfChanged( this.data.ID );
			store.set( 'wpcom_user', this.data );
		} else {
			// The user is logged out
			this.initialized = true;
		}
	} else {
		this.data = store.get( 'wpcom_user' ) || false;

		// Make sure that the user stored in localStorage matches the logged-in user
		this.fetch();

	}

	if ( this.data ) {
		this.initialized = true;
		this.emit( 'change' );
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
	if ( ! this.data ) {
		this.fetch();
	}
	return this.data;
};


/**
 * Fetch the current user from WordPress.com via the REST API
 * and stores it in local cache.
 *
 * @uses `wpcom`
 */
User.prototype.fetch = function() {
	if ( this.fetching ) {
		return;
	}

	var me = wpcom.me();

	// Request current user info
	this.fetching = true;
	debug( 'Getting user from api' );

	me.get( { meta: 'flags' }, function( error, data ) {
		if ( error ) {
			if ( ! config( 'wpcom_user_bootstrap' ) && error.error === 'authorization_required' ) {
				/**
				 * if the user bootstrap is disabled (in development), we need to rely on a request to
				 * /me to determine if the user is logged in.
				 */
				debug( 'The user is not logged in.' );

				this.initialized = true;
				this.emit( 'change' );
			} else {
				debug( 'Something went wrong trying to get the user.' );
			}
			return;
		}

		var userData = userUtils.filterUserObject( data );

		// Release lock from subsequent fetches
		this.fetching = false;

		this.clearStoreIfChanged( userData.ID );

		// Store user info in `this.data` and localstorage as `wpcom_user`
		store.set( 'wpcom_user', userData );
		this.data = userData;
		if ( this.settings ) {
			debug( 'Retaining fetched settings data in new user data' );
			this.data.settings = this.settings;
		}
		this.initialized = true;

		this.emit( 'change' );

		debug( 'User successfully retrieved' );

	}.bind( this ) );
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

User.prototype.clear = function() {
	/**
	 * Clear internal user data and empty localStorage cache
	 * to discard any user reference that the application may hold
	 */
	this.data = [];
	delete this.settings;
	store.clear();
	if ( config.isEnabled( 'persist-redux' ) ) {
		localforage.removeItem( 'redux-state' );
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
