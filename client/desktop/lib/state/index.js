/**
 * Internal dependencies
 */
const keychain = require( 'calypso/desktop/lib/keychain' );

/**
 * Module variables
 */

let state = false;

function State() {
	this.loggedIn = false;
	this.user = false;
}

State.prototype.isLoggedIn = function () {
	return this.loggedIn;
};

State.prototype.login = async function ( { user, token } ) {
	this.loggedIn = true;

	if ( user && token ) {
		this.user = {
			id: user.data.ID,
			token: `${ token }`,
		};
		keychain.setUserInfo( this.user );
	}
};

State.prototype.getUser = function () {
	if ( ! this.user && this.loggedIn ) {
		this.user = keychain.getUserInfo();
	}
	return this.user;
};

State.prototype.logout = function () {
	this.loggedIn = false;
	this.user = false;
	keychain.clear();
};

State.prototype.setLogPath = function ( path ) {
	this.logPath = path;
};

State.prototype.getLogPath = function () {
	return this.logPath;
};

if ( ! state ) {
	state = new State();
}

module.exports = state;
