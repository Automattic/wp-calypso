/**
 * Internal dependencies
 */
var Emitter = require( 'lib/mixins/emitter' );


/**
 * Lock component
 *
 * @api public
 */
function Lock() {
	this.instance = null;
}

/**
 * Mixins
 */
Emitter( Lock.prototype );


Lock.prototype.isLocked = function() {
	return !! this.instance;
};


Lock.prototype.hasLock = function( instance ) {
	return instance === this.instance;
};


Lock.prototype.mustWait = function( instance ) {
	return this.isLocked() && ! this.hasLock( instance );
};


Lock.prototype.lock = function( instance ) {
	if ( ! this.instance ) {
		this.instance = instance;
		this.emit( 'change' );
		return true;
	}
	return false;
};


Lock.prototype.unlock = function( instance, opts ) {
	opts = opts || {};
	if ( instance === this.instance ) {
		this.instance = null;
		if ( ! opts.silent ) {
			this.emit( 'change' );
		}
		return true;
	}
	return false;
};


module.exports = Lock;
