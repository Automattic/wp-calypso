/**
 * External dependencies
 */

import { entries, isEqual } from 'lodash';
import store from 'store';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:user' );
import config from 'config';
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import {
	isSupportUserSession,
	isSupportNextSession,
	supportUserBoot,
	supportNextBoot,
} from 'lib/user/support-user-interop';
import wpcom from 'lib/wp';
import Emitter from 'lib/mixins/emitter';
import { isE2ETest } from 'lib/e2e';
import { getComputedAttributes, filterUserObject } from './shared-utils';
import { getLanguage } from 'lib/i18n-utils/utils';
import { clearStorage } from 'lib/browser-storage';
import { getActiveTestNames, ABTEST_LOCALSTORAGE_KEY } from 'lib/abtest/utility';

/**
 * User component
 *
 * @class
 */
function User() {
	if ( ! ( this instanceof User ) ) {
		return new User();
	}
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
User.prototype.initialize = async function () {
	debug( 'Initializing User' );
	this.fetching = false;
	this.data = false;

	this.on( 'change', this.checkVerification.bind( this ) );

	let skipBootstrap = false;

	if ( isSupportUserSession() ) {
		// boot the support session and skip the user bootstrap: the server sent the unwanted
		// user info there (me) instead of the target SU user.
		supportUserBoot();
		skipBootstrap = true;
	}

	if ( isSupportNextSession() ) {
		// boot the support session and proceed with user bootstrap (unlike the SupportUserSession,
		// the initial GET request includes the right cookies and header and returns a server-generated
		// page with the right window.currentUser value)
		supportNextBoot();
	}

	if ( ! skipBootstrap && config.isEnabled( 'wpcom-user-bootstrap' ) ) {
		debug( 'Bootstrapping user data:', this.data );
		if ( window.currentUser ) {
			this.handleFetchSuccess( window.currentUser );
		}
		return;
	}

	// fetch the user from the /me endpoint if it wasn't bootstrapped
	await this.fetch();
};

/**
 * Clear localStorage when we detect that there is a mismatch between the ID
 * of the user stored in localStorage and the current user ID
 *
 * @param {number} userId The new user ID.
 **/
User.prototype.clearStoreIfChanged = function ( userId ) {
	const storedUserId = store.get( 'wpcom_user_id' );

	if ( storedUserId != null && storedUserId !== userId ) {
		debug( 'Clearing localStorage because user changed' );
		store.clearAll();
	}
};

/**
 * Get user data
 *
 * @returns {object} The user data.
 */
User.prototype.get = function () {
	return this.data;
};

/**
 * Fetch the current user from WordPress.com via the REST API
 * and stores it in local cache.
 *
 * @returns {Promise<void>} Promise that resolves (with no value) when fetching is finished
 */
User.prototype.fetch = function () {
	if ( this.fetching ) {
		// if already fetching, return the in-flight promise
		return this.fetching;
	}

	// Request current user info
	debug( 'Getting user from api' );
	this.fetching = wpcom
		.me()
		.get( {
			meta: 'flags',
			abtests: getActiveTestNames( { appendDatestamp: true, asCSV: true } ),
		} )
		.then( ( data ) => {
			debug( 'User successfully retrieved from api:', data );
			const userData = filterUserObject( data );
			this.handleFetchSuccess( userData );
		} )
		.catch( ( error ) => {
			debug( 'Failed to retrieve user from api:', error );
			this.handleFetchFailure( error );
		} )
		.finally( () => {
			this.fetching = false;
		} );

	return this.fetching;
};

/**
 * Handles user fetch failure from WordPress.com REST API by updating User's state
 * and emitting a change event.
 *
 * @param {Error} error network response error
 */
User.prototype.handleFetchFailure = function ( error ) {
	if ( error.error === 'authorization_required' ) {
		debug( 'The user is not logged in.' );
		this.data = false;
		this.emit( 'change' );
	} else {
		// eslint-disable-next-line no-console
		console.error( 'Failed to fetch the user from /me endpoint:', error );
	}
};

/**
 * Handles user fetch success from WordPress.com REST API by persisting the user data
 * in the browser's localStorage. It also changes the User's fetching and initialized states
 * and emits a change event.
 *
 * @param {object} userData an object containing the user's information.
 */
User.prototype.handleFetchSuccess = function ( userData ) {
	this.clearStoreIfChanged( userData.ID );

	// Store user ID in local storage so that we can detect a change and clear the storage
	store.set( 'wpcom_user_id', userData.ID );

	if ( userData.abtests ) {
		if ( config.isEnabled( 'dev/test-helper' ) || isE2ETest() ) {
			// This section will preserve the existing localStorage A/B variation values,
			// This is necessary for the A/B test helper component and e2e tests..
			const initialVariationsFromStore = store.get( ABTEST_LOCALSTORAGE_KEY );
			const initialVariations =
				typeof initialVariationsFromStore === 'object' ? initialVariationsFromStore : undefined;
			store.set( ABTEST_LOCALSTORAGE_KEY, {
				...userData.abtests,
				...initialVariations,
			} );
		} else {
			store.set( ABTEST_LOCALSTORAGE_KEY, userData.abtests );
		}
	}
	this.data = userData;
	this.emit( 'change' );
};

User.prototype.getLanguage = function () {
	return getLanguage( this.data.localeSlug );
};

/**
 * Get the URL for a user's avatar (from Gravatar). Uses
 * the short-form query string parameters as options,
 * sets some sane defaults.
 *
 * @param {object} options Options per https://secure.gravatar.com/site/implement/images/
 *
 * @returns {string} The user's avatar URL based on the options parameter.
 */
User.prototype.getAvatarUrl = function ( options ) {
	const default_options = {
		s: 80,
		d: 'mm',
		r: 'G',
	};
	const avatar_URL = this.get().avatar_URL;
	const avatar = typeof avatar_URL === 'string' ? avatar_URL.split( '?' )[ 0 ] : '';

	options = options || {};
	options = Object.assign( {}, options, default_options );

	return avatar + '?' + stringify( options );
};

/**
 * Clear any user data.
 */
User.prototype.clear = async function () {
	/**
	 * Clear internal user data and empty localStorage cache
	 * to discard any user reference that the application may hold
	 */
	this.data = false;
	store.clearAll();
	if ( config.isEnabled( 'persist-redux' ) ) {
		await clearStorage();
	}
};

/**
 * Sends the user an email with a link to verify their account if they
 * are unverified.
 *
 * @param {Function} [fn] A callback to receive the HTTP response from the send-verification-email endpoint.
 *
 * @returns {(Promise|object)} If a callback is provided, this is an object representing an XMLHttpRequest.
 *                             If no callback is provided, this is a Promise.
 */
User.prototype.sendVerificationEmail = function ( fn ) {
	return wpcom.undocumented().me().sendVerificationEmail( fn );
};

User.prototype.set = function ( attributes ) {
	let changed = false;

	for ( const [ attrName, attrValue ] of entries( attributes ) ) {
		if ( ! isEqual( attrValue, this.data[ attrName ] ) ) {
			this.data[ attrName ] = attrValue;
			changed = true;
		}
	}

	if ( changed ) {
		Object.assign( this.data, getComputedAttributes( this.data ) );
		this.emit( 'change' );
	}

	return changed;
};

User.prototype.decrementSiteCount = function () {
	const user = this.get();
	if ( user ) {
		this.set( {
			visible_site_count: user.visible_site_count - 1,
			site_count: user.site_count - 1,
		} );
	}
	this.fetch();
};

User.prototype.incrementSiteCount = function () {
	const user = this.get();
	if ( user ) {
		return this.set( {
			visible_site_count: user.visible_site_count + 1,
			site_count: user.site_count + 1,
		} );
	}
	this.fetch();
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

User.prototype.verificationPollerCallback = function ( signal ) {
	// skip server poll if page is hidden or there are no listeners
	// and this was not triggered by a localStorage signal
	if ( ( document.hidden || this.listeners( 'verify' ).length === 0 ) && ! signal ) {
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

User.prototype.checkVerification = function () {
	if ( ! this.get() ) {
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

	this.verificationPoller = setInterval(
		this.verificationPollerCallback.bind( this ),
		VERIFICATION_POLL_INTERVAL
	);

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

User.prototype.signalVerification = function () {
	if ( window.localStorage ) {
		// use localStorage to signal to other browser windows that the user's email was verified
		window.localStorage.setItem( '__email_verified_signal__', 1 );
		debug( 'Verification: SENT SIGNAL' );
	}
};

/**
 * Expose `User`
 */
export default User;
