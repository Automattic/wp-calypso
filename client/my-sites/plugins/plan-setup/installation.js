/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:store-transactions' ),
	isEmpty = require( 'lodash/lang/isEmpty' ),
	Readable = require( 'stream' ).Readable,
	inherits = require( 'inherits' );

/**
 * Internal dependencies
 */
 var PluginsActions = require( 'lib/plugins/actions' ),
	 PluginsStore = require( 'lib/plugins/store' );

/**
 * Start provisioning premium plugins for a given site
 *
 * @returns {Readable} A stream of installation steps.
 *
 * @param {JetpackSite} site - The site where plugins should be installed
 * @param {array} plugins - List of the plugins to install
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
InstallationFlow.prototype.installAll = function( slugs, callback ){
	let slug;
	let installNext = () => {
		if ( slugs.length > 0 ) {
			slug = slugs.shift();
			console.log( 'install', slug );
			this.install( slug, installNext );
		} else {
			this._pushStep( null );
		}
	};

	installNext();
}

InstallationFlow.prototype.install = function( slug, next ){
	this._pushStep( { name: 'install-plugin', plugin: slug } );
	let site = this._initialData.site;

	// Install the plugin. `installer` is a promise, so we can wait for the install
	// to finish before trying to configure the plugin.
	let installer = PluginsActions.installPlugin( site, { slug: slug } );
	installer.then( () => {
		this._pushStep( { name: 'configure-plugin', plugin: slug } );
		// Configure the plugin (process depends on which plugin)
		switch ( slug ) {
			case 'vaultpress':
				configureVaultPress( site, this._initialData.vaultpressKey, next );
				break;
			case 'akismet':
				configureAkismet( site, this._initialData.akismetKey, next );
				break;
			case 'polldaddy':
				configurePolldaddy( site, this._initialData.polldaddyKey, next );
				break;
		}
	} );
}

// Configure VaultPress. Get the `vaultpress` option, which is an array. Update
// the registration key inside the array, then re-save. Trigger a connection
// from the site to VP so the VP db knows about the site (?)
function configureVaultPress( site, key, callback ) {
	site.getOption( { option_name: 'vaultpress' }, ( error, data ) => {
		if ( error ) {
			return;
		}
		// Might need to build up the option_value?
		let option_value = data.option_value || {};
		option_value.key = key;
		site.setOption( { option_name: 'vaultpress', is_array: true, option_value: option_value }, ( error, data ) => {
			callback();
		} );
	} );
}

// Configure Polldaddy. Save the `polldaddy_api_key`.
function configurePolldaddy( site, key, callback ) {
	site.setOption( { option_name: 'wordpress_api_key', option_value: key }, ( error, data ) => {
		callback();
	} );
}

// Configure Akismet. Set the `wordpress_api_key`, then trigger a connection from
// the site to notify Akismet of a new site.
function configureAkismet( site, key, callback ) {
	site.setOption( { option_name: 'polldaddy_api_key', option_value: key }, ( error, data ) => {
		callback();
	} );
}

module.exports = {
	start: start,
};
