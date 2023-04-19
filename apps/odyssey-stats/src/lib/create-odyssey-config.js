// The JSON is filtered by `apps/stats/filter-json-config-loader.js`.
import productionConfig from '../../../../config/production.json';

export class ConfigApi extends Function {
	/**
	 * Make instances callable.
	 */
	constructor() {
		super( '...args', 'return this._bound._call(...args)' );
		// Holds the config data.
		this.configData = {};
		this._bound = this.bind( this );
		return this._bound;
	}

	_call( key ) {
		if ( key in this.configData ) {
			return this.configData[ key ];
		}

		if ( 'development' === process.env.NODE_ENV ) {
			throw new ReferenceError(
				`Could not find config value for key '${ key }'\n` +
					"Please make sure that if you need it then it has a default value assigned in 'config/_shared.json'"
			);
		}

		return undefined;
	}
}

// Copied from https://github.com/Automattic/wp-calypso/blob/ca7d8fe3e0a5fb87b0659fbab659078ebbfbc7be/apps/odyssey-stats/src/load-config.js
ConfigApi.prototype._overrideConfigDataFeatures = function () {
	// Set is_running_in_jetpack_site to true if not specified (undefined or null).
	productionConfig.features.is_running_in_jetpack_site =
		this.configData.features?.is_running_in_jetpack_site ?? true;

	// The option enables loading of the whole translation file, and could be optimized by setting it to `true`, which needs the translation chunks in place.
	// @see https://github.com/Automattic/wp-calypso/blob/trunk/docs/translation-chunks.md
	productionConfig.features[ 'use-translation-chunks' ] = false;

	// Note: configData is hydrated in https://github.com/Automattic/jetpack/blob/d4d0f987cbf63a864b03b542b7813aabe87e0ed3/projects/packages/stats-admin/src/class-dashboard.php#L214
	this.configData.features = productionConfig.features;
};

// Forked from https://github.com/Automattic/wp-calypso/blob/ca7d8fe3e0a5fb87b0659fbab659078ebbfbc7be/packages/calypso-config/src/index.ts#L60
ConfigApi.prototype._applyFlags = function ( flagsString, modificationMethod ) {
	const flags = flagsString.split( ',' );
	flags.forEach( ( flagRaw ) => {
		const flag = flagRaw.replace( /^[-+]/, '' );
		const enabled = ! /^-/.test( flagRaw );
		if ( this.configData.features ) {
			this.configData.features[ flag ] = enabled;
			// eslint-disable-next-line no-console
			console.log(
				'%cConfig flag %s via %s: %s',
				'font-weight: bold;',
				enabled ? 'enabled' : 'disabled',
				modificationMethod,
				flag
			);
		}
	} );
};

/**
 * Apply feature flags from the URL and Hash.
 */
ConfigApi.prototype._applyUrlFlags = function () {
	const UrlMatch =
		document.location.search && document.location.search.match( /[?&]flags=([^&]+)(&|$)/ );
	if ( UrlMatch ) {
		this._applyFlags( decodeURIComponent( UrlMatch[ 1 ] ), 'URL' );
	}
	const hashMatch =
		document.location.hash && document.location.hash.match( /[?&]flags=([^&]+)(&|$)/ );
	if ( hashMatch ) {
		this._applyFlags( decodeURIComponent( hashMatch[ 1 ] ), 'HASH' );
	}
};

/**
 * Init config data
 *
 * @param {string} configKey the key to use for the config data.
 */
ConfigApi.prototype.init = function ( configKey = 'configData' ) {
	/**
	 * Manages config flags for various deployment builds
	 *
	 * @module config/index
	 */
	if ( 'undefined' === typeof window ) {
		throw new Error( 'Trying to initialize the configuration outside of a browser context.' );
	}

	if ( ! window[ configKey ] ) {
		if ( 'development' === process.env.NODE_ENV ) {
			// eslint-disable-next-line no-console
			console.error(
				'%cNo configuration was found: ' +
					'%cPlease see ' +
					'%cpackages/calypso-config/README.md ' +
					'%cfor more information.',
				'color: red; font-size: 120%', // error prefix
				'color: white;', // message
				'color: #0267ff;', // calypso-config README.md file reference
				'color: white' // message
			);
		}
	}
	// Fallback to window.configData for backwards compatibility.
	this.configData = window[ configKey ] ?? window.configData ?? this.configData;
	this._overrideConfigDataFeatures();
	this._applyUrlFlags();
};

ConfigApi.prototype.getConfigData = function () {
	return this.configData;
};

ConfigApi.prototype.setConfigData = function ( data ) {
	this.configData = data;
};

// The following public methods are all originated from https://github.com/Automattic/wp-calypso/blob/ca7d8fe3e0a5fb87b0659fbab659078ebbfbc7be/packages/create-calypso-config/src/index.ts
ConfigApi.prototype.isEnabled = function ( feature ) {
	return ( this.configData.features && !! this.configData.features[ feature ] ) || false;
};

ConfigApi.prototype.enabledFeatures = function () {
	if ( ! this.configData.features ) {
		return [];
	}
	return Object.entries( this.configData.features ).reduce(
		( enabled, [ feature, isEnabled ] ) => ( isEnabled ? [ ...enabled, feature ] : enabled ),
		[]
	);
};

ConfigApi.prototype.enable = function ( feature ) {
	if ( this.configData.features ) {
		this.configData.features[ feature ] = true;
	}
};

ConfigApi.prototype.disable = function ( feature ) {
	if ( this.configData.features ) {
		this.configData.features[ feature ] = false;
	}
};

export function createOdysseyConfigFromKey( configKey = 'configData' ) {
	const configApi = new ConfigApi();
	configApi.init( configKey );
	return configApi;
}

export default function createOdysseyConfigFromConfigData( configData ) {
	const configApi = new ConfigApi();
	configApi.setConfigData( configData );
	return configApi;
}
