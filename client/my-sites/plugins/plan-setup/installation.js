/**
 * External dependencies
 */
import { Readable } from 'stream';
import inherits from 'inherits';
import keys from 'lodash/keys';

/**
 * Internal dependencies
 */
import PluginsActions from 'lib/plugins/actions';
import PluginsStore from 'lib/plugins/store';

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

	this._initialData.site.fetchJetpackKeys( ( error, data ) => {
		if ( error ) {
			console.warn( error );
			return;
		}
		this.installAll( data.keys );
	} );
};

InstallationFlow.prototype._pushStep = function( options ) {
	var defaults = {
		timestamp: Date.now()
	};

	this.push( Object.assign( defaults, options ) );
};

// Install each plugin sequentially via a recursive callback
InstallationFlow.prototype.installAll = function( plugins ) {
	let slugs = keys( plugins );
	let slug;
	let installNext = () => {
		if ( slugs.length > 0 ) {
			slug = slugs.shift();
			this.install( slug, plugins[slug], installNext );
		} else {
			this._pushStep( null );
		}
	};

	installNext();
}

InstallationFlow.prototype.install = function( slug, key, next ) {
	this._pushStep( { name: 'install-plugin', plugin: slug } );
	let site = this._initialData.site;
	let plugin = PluginsStore.getSitePlugin( site, slug );
	if ( ! plugin && PluginsStore.isFetchingSite( site ) ) {
		// if the Plugins are still being fetched, we wait. We are not using flux
		// store events because it would be more messy to handle the one-time-only
		// callback with bound parameters than to do it this way.
		return setTimeout( this.install.bind( this, slug, key, next ), 500 );
	};
	plugin = plugin || { slug: slug };
	// Install the plugin. `installer` is a promise, so we can wait for the install
	// to finish before trying to configure the plugin.
	let installer = PluginsActions.installPlugin( site, plugin );
	installer.then( ( response ) => {
		if ( 'undefined' !== typeof response.error ) {
			// @todo Handle failed installs
			if ( response.error.name === 'UpdateFailError' ) {
				console.warn( 'Plugin not up-to-date, cannot continue.' );
			} else {
				console.warn( response.error );
			}
			return;
		}
		this._pushStep( { name: 'configure-plugin', plugin: slug } );
		// Configure the plugin
		configureOption( site, plugin, key, next );
	} );
}

// Configure the relevant option for each plugin
function configureOption( site, plugin, key, callback ) {
	let option = false;
	switch ( plugin.slug ) {
		case 'vaultpress':
			option = 'vaultpress_auto_register';
			break;
		case 'akismet':
			option = 'wordpress_api_key';
			break;
		case 'polldaddy':
			option = 'polldaddy_api_key';
			break;
	}
	if ( ! option ) {
		callback();
		return;
	}
	site.setOption( { option_name: option, option_value: key }, ( error ) => {
		if ( error ) {
			console.warn( error );
		}
		callback();
	} );
}

module.exports = {
	start: start,
};
