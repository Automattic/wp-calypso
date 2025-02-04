import { ConfigData } from '@automattic/create-calypso-config/src';
// The JSON is filtered by `apps/stats/filter-json-config-loader.js`.
import productionConfig from '../../../../config/production.json';

export class ConfigApi extends Function {
	// Holds the config data.
	configData: ConfigData;
	_bound: ConfigApi;

	constructor() {
		/**
		 * Make instances callable.
		 */
		super( '...args', 'return this._bound._call(...args)' );
		this.configData = {};
		this._bound = this.bind( this );
		return this._bound;
	}

	/**
	 * Make instances callable.
	 */
	_call( key: string ) {
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

	/**
	 * Init config data
	 */
	init( configKey = 'configData' ) {
		/**
		 * Manages config flags for various deployment builds
		 * @module config/index
		 */
		if ( 'undefined' === typeof window ) {
			throw new Error( 'Trying to initialize the configuration outside of a browser context.' );
		}

		if ( ! ( window as { [ key: string ]: any } )[ configKey ] ) {
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
		this.configData =
			( window as unknown as Record< string, ConfigData > )[ configKey ] ??
			window.configData ??
			this.configData;
		this._overrideConfigDataFeatures();
		this._applyUrlFlags();
	}

	getConfigData() {
		return this.configData;
	}

	setConfigData( data: ConfigData ) {
		this.configData = data;
	}

	// The following public methods are all originated from https://github.com/Automattic/wp-calypso/blob/ca7d8fe3e0a5fb87b0659fbab659078ebbfbc7be/packages/create-calypso-config/src/index.ts
	isEnabled( feature: string ): boolean {
		return ( this.configData.features && !! this.configData.features[ feature ] ) || false;
	}

	enabledFeatures(): string[] {
		if ( ! this.configData.features ) {
			return [];
		}
		return Object.entries( this.configData.features ).reduce(
			( enabled, [ feature, isEnabled ] ) => ( isEnabled ? [ ...enabled, feature ] : enabled ),
			[] as string[]
		);
	}

	enable( feature: string ) {
		if ( this.configData.features ) {
			this.configData.features[ feature ] = true;
		}
	}

	disable( feature: string ) {
		if ( this.configData.features ) {
			this.configData.features[ feature ] = false;
		}
	}

	// Copied from https://github.com/Automattic/wp-calypso/blob/ca7d8fe3e0a5fb87b0659fbab659078ebbfbc7be/apps/odyssey-stats/src/load-config.js
	_overrideConfigDataFeatures() {
		// Set is_running_in_jetpack_site to true if not specified (undefined or null).
		productionConfig.features.is_running_in_jetpack_site =
			this.configData.features?.is_running_in_jetpack_site ?? true;

		// The option enables loading of the whole translation file, and could be optimized by setting it to `true`, which needs the translation chunks in place.
		// @see https://github.com/Automattic/wp-calypso/blob/trunk/docs/translation-chunks.md
		productionConfig.features[ 'use-translation-chunks' ] = false;

		// Note: configData is hydrated in https://github.com/Automattic/jetpack/blob/d4d0f987cbf63a864b03b542b7813aabe87e0ed3/projects/packages/stats-admin/src/class-dashboard.php#L214
		this.configData.features = productionConfig.features;

		// Set a flag to identify if the app is running in WP Admin.
		// `is_running_in_jetpack_site` now means whether the app calls public-api directly or use the Jetpack ones.
		// For Simple sites running Odyssey Stats, `is_running_in_jetpack_site` is true and `is_odyssey` is false.
		this.configData.features.is_odyssey = true;

		// Sets the Blaze Dashboard path prefix.
		this.configData.advertising_dashboard_path_prefix = '/advertising';
	}

	// Copied from https://github.com/Automattic/wp-calypso/blob/ca7d8fe3e0a5fb87b0659fbab659078ebbfbc7be/packages/calypso-config/src/index.ts#L60
	_applyFlags( flagsString: string, modificationMethod: string ) {
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
	}

	/**
	 * Apply feature flags from the URL and Hash.
	 */
	_applyUrlFlags() {
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
	}
}

export function createOdysseyConfigFromKey( configKey = 'configData' ) {
	const configApi = new ConfigApi();
	configApi.init( configKey );
	return configApi;
}

export default function createOdysseyConfigFromConfigData( configData: ConfigData ) {
	const configApi = new ConfigApi();
	configApi.setConfigData( configData );
	return configApi;
}
