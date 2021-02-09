/**
 * Module variables
 */

let state = false;

function State() {
	this.loggedIn = false;
}

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
