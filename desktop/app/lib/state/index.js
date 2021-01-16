/**
 * Module variables
 */

let state = false;

function State() {
	this.loggedIn = false;
}

State.prototype.isLoggedIn = function () {
	return this.loggedIn;
};

State.prototype.login = async function () {
	this.loggedIn = true;
};

State.prototype.getUser = function () {
	return this.user;
};

State.prototype.logout = function () {
	this.loggedIn = false;
	this.user = false;
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
