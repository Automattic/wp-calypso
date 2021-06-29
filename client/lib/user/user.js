/**
 * External dependencies
 */
import debugFactory from 'debug';
import config from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import {
	isSupportUserSession,
	isSupportNextSession,
	supportUserBoot,
	supportNextBoot,
} from 'calypso/lib/user/support-user-interop';
import wpcom from 'calypso/lib/wp';
import Emitter from 'calypso/lib/mixins/emitter';
import { clearStore, getStoredUserId, setStoredUserId } from './store';
import { filterUserObject } from './shared-utils';

const debug = debugFactory( 'calypso:user' );

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
	const storedUserId = getStoredUserId();

	if ( storedUserId != null && storedUserId !== userId ) {
		debug( 'Clearing localStorage because user changed' );
		clearStore();
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
	setStoredUserId( userData.ID );

	this.data = userData;

	this.emit( 'change' );
};

/**
 * Expose `User`
 */
export default User;
