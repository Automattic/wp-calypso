'use strict';

/**
 * Module variables
 */

let state = false;

function State() {
	this.loggedIn = false;
}

State.prototype.isLoggedIn = function( ) {
	return this.loggedIn;
};

State.prototype.login = function( ) {
	this.loggedIn = true;
};

State.prototype.logout = function( ) {
	this.loggedIn = false;
};

if ( ! state ) {
	state = new State();
}

module.exports = state;
