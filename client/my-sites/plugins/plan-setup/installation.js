/**
 * External dependencies
 */
var Readable = require( 'stream' ).Readable,
	inherits = require( 'inherits' );

/**
 * Internal dependencies
 */
var PluginsActions = require( 'lib/plugins/actions' );

/**
 * Start provisioning premium plugins for a given site
 *
 * @returns {Readable} A stream of installation steps.
 *
 * @param {object} params - List of initial data passed to Installation process
 * @param {JetpackSite} params.site - The site where plugins should be installed
 * @param {array} params.plugins - List of the plugins to install
 */
function start( params ) {
	return new InstallationFlow( params );
}

function InstallationFlow( initialData ) {
	Readable.call( this, { objectMode: true } );
	this._initialData = initialData;
	this._hasStarted = false;
}
inherits( InstallationFlow, Readable );

/**
 * Pushes new data onto the stream. Whenever someone wants to read from the
 * stream of steps, this method will get called because we inherited the
 * functionality of `Readable`.
 *
 * Our goal is to capture the flow of the asynchronous callback functions as a
 * linear sequence of steps. When we get the first request for data, we begin
 * the chain of asynchronous functions. On future requests for data, there is
 * no need to start another asynchronous process, so we just return immediately
 * while the first one finises.
 *
 * @see TransactionFlow
 */
InstallationFlow.prototype._read = function() {
	if ( this._hasStarted ) {
		return false;
	}
	this._hasStarted = true;

	this.installAll( this._initialData.plugins );
};

InstallationFlow.prototype._pushStep = function( options ) {
	var defaults = {
		timestamp: Date.now()
	};

	this.push( Object.assign( defaults, options ) );
};

// Install each plugin sequentially via a recursive callback
InstallationFlow.prototype.installAll = function( slugs ) {
	let slug;
	let installNext = () => {
		if ( slugs.length > 0 ) {
			slug = slugs.shift();
			this.install( slug, installNext );
		} else {
			this._pushStep( null );
		}
	};

	installNext();
}

InstallationFlow.prototype.install = function( slug, next ) {
	this._pushStep( { name: 'install-plugin', plugin: slug } );
	let site = this._initialData.site;

	// Install the plugin. `installer` is a promise, so we can wait for the install
	// to finish before trying to configure the plugin.
	let installer = PluginsActions.installPlugin( site, { slug: slug } );
	installer.then( () => {
		// @todo Handle failed installs - most likely the plugin already exists,
		// and needs to be activated.
		// @todo Registration keys will be set here.
		next();
	} );
}

module.exports = {
	start: start,
};
