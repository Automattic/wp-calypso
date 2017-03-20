'use strict';

/**
 * Module variables
 */
let quitter = false;

function AppQuit() {
	this.canQuit = false;
}

AppQuit.prototype.shouldQuitToBackground = function() {
	if ( this.canQuit === false ) {
		return true;
	}

	this.canQuit = false;
	return false;
};

AppQuit.prototype.allowQuit = function() {
	this.canQuit = true;
};

if ( ! quitter ) {
	quitter = new AppQuit();
}

module.exports = quitter;
