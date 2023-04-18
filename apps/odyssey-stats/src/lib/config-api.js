/**
 * The config package is to provide a comaptible way to access config data exactly like `@automattic/calypso-config`.
 *
 * - The package supports custom config data source, which is useful for Odyssey Apps.
 * - Restored feature flag gating for Odyssey Apps.
 * - The package must be initialized before using with `initConfig`.
 */

// The JSON is filtered by `apps/stats/filter-json-config-loader.js`.
import productionConfig from '../../../../config/production.json';

// Store the processed config data.
let configData = {};

const configApi = ( key ) => {
	if ( key in configData ) {
		return configData[ key ];
	}
	return undefined;
};

configApi.isEnabled = ( feature ) =>
	( configData.features && !! configData.features[ feature ] ) || false;

configApi.enabledFeatures = () => {
	if ( ! configData.features ) {
		return [];
	}
	return Object.entries( configData.features ).reduce(
		( enabled, [ feature, isEnabled ] ) => ( isEnabled ? [ ...enabled, feature ] : enabled ),
		[]
	);
};

configApi.enable = ( feature ) => {
	if ( configData.features ) {
		configData.features[ feature ] = true;
	}
};

configApi.disable = ( feature ) => {
	if ( configData.features ) {
		configData.features[ feature ] = false;
	}
};

const configOverride = () => {
	// Set is_running_in_jetpack_site to true if not specified (undefined or null).
	productionConfig.features.is_running_in_jetpack_site =
		configData.features?.is_running_in_jetpack_site ?? true;

	// The option enables loading of the whole translation file, and could be optimized by setting it to `true`, which needs the translation chunks in place.
	// @see https://github.com/Automattic/wp-calypso/blob/trunk/docs/translation-chunks.md
	productionConfig.features[ 'use-translation-chunks' ] = false;

	// Note: configData is hydrated in https://github.com/Automattic/jetpack/blob/d4d0f987cbf63a864b03b542b7813aabe87e0ed3/projects/packages/stats-admin/src/class-dashboard.php#L214
	configData.features = productionConfig.features;
	return configData;
};

const applyFlags = ( flagsString, modificationMethod ) => {
	const flags = flagsString.split( ',' );
	flags.forEach( ( flagRaw ) => {
		const flag = flagRaw.replace( /^[-+]/, '' );
		const enabled = ! /^-/.test( flagRaw );
		if ( configData.features ) {
			configData.features[ flag ] = enabled;
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

const applyUrlFlags = () => {
	const UrlMatch =
		document.location.search && document.location.search.match( /[?&]flags=([^&]+)(&|$)/ );
	if ( UrlMatch ) {
		applyFlags( decodeURIComponent( UrlMatch[ 1 ] ), 'URL' );
	}
	const hashMatch =
		document.location.hash && document.location.hash.match( /[?&]flags=([^&]+)(&|$)/ );
	if ( hashMatch ) {
		applyFlags( decodeURIComponent( hashMatch[ 1 ] ), 'HASH' );
	}
};

// check if the current browser location is *.calypso.live
export function isCalypsoLive() {
	return false;
}

/**
 * Init config data
 *
 * @param {string} configKey the key to use for the config data.
 * @returns {Object} config data.
 */
export const initConfig = ( configKey = 'configData' ) => {
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
	configData = window[ configKey ] ?? window.configData ?? configData;
	configOverride();
	applyUrlFlags();
	return configData;
};

export default configApi;
export const isEnabled = configApi.isEnabled;
export const enabledFeatures = configApi.enabledFeatures;
export const enable = configApi.enable;
export const disable = configApi.disable;
