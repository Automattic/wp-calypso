export type ConfigValue = string | boolean | number;

export type ConfigData = Record< string, any > & {
	features?: Record< string, boolean >;
};
/**
 * Returns configuration value for given key
 *
 * If the requested key isn't defined in the configuration
 * data then this will report the failure with either an
 * error or a console warning.
 *
 * The config files are loaded in sequence: _shared.json, {env}.json, {env}.local.json
 *
 * @see server/config/parser.js
 * @param data Configurat data.
 * @returns A function that gets the value of property named by the key
 */
const config =
	( data: ConfigData ) =>
	< T >( key: string ): T | undefined => {
		if ( key in data ) {
			return data[ key ] as T;
		}

		// Display console error in a browser during development
		// (not in tests, for example)
		if ( 'development' === process.env.NODE_ENV && 'undefined' !== typeof window ) {
			// eslint-disable-next-line no-console
			console.error(
				'%cCore Error: ' +
					`%cCould not find config value for key %c${ key }%c. ` +
					'Please make sure that if you need it then it has a default value assigned in ' +
					'%cconfig/_shared.json' +
					'%c.',
				'color: red; font-size: 120%', // error prefix
				'color: black;', // message
				'color: blue;', // key name
				'color: black;', // message
				'color: blue;', // config file reference
				'color: black' // message
			);
		}

		return undefined;
	};

/**
 * Checks whether a specific feature is enabled.
 *
 * @param data the json environment configuration to use for getting config values
 * @returns A function that takes a feature name and returns true when the feature is enabled.
 */
const isEnabled =
	( data: ConfigData ) =>
	( feature: string ): boolean =>
		( data.features && !! data.features[ feature ] ) || false;

/**
 * Gets a list of all enabled features.
 *
 * @param data A set of config data (Not used by general users, is pre-filled via currying).
 * @returns List of enabled features (strings).
 */
const enabledFeatures = ( data: ConfigData ) => (): string[] => {
	if ( ! data.features ) {
		return [];
	}
	return Object.entries( data.features ).reduce(
		( enabled, [ feature, isEnabled ] ) => ( isEnabled ? [ ...enabled, feature ] : enabled ),
		[] as string[]
	);
};

/**
 * Enables a specific feature.
 *
 * @param data the json environment configuration to use for getting config values
 */
const enable = ( data: ConfigData ) => ( feature: string ) => {
	if ( data.features ) {
		data.features[ feature ] = true;
	}
};

/**
 * Disables a specific feature.
 *
 * @param data the json environment configuration to use for getting config values
 */

const disable = ( data: ConfigData ) => ( feature: string ) => {
	if ( data.features ) {
		data.features[ feature ] = false;
	}
};

export interface ConfigApi {
	< T >( key: string ): T;
	isEnabled: ( feature: string ) => boolean;
	enabledFeatures: () => string[];
	enable: ( feature: string ) => void;
	disable: ( feature: string ) => void;
}

export default ( data: ConfigData ): ConfigApi => {
	const configApi = config( data ) as ConfigApi;
	configApi.isEnabled = isEnabled( data );
	configApi.enabledFeatures = enabledFeatures( data );
	configApi.enable = enable( data );
	configApi.disable = disable( data );

	return configApi;
};
