/**
 * Returns configuration value for given key
 *
 * If the requested key isn't defined in the configuration
 * data then this will report the failure with either an
 * error or a console warning.
 *
 * When in the 'development' NODE_ENV it will raise an error
 * to crash execution early. However, because many modules
 * call this function in the module-global scope a failure
 * here can not only crash that module but also entire
 * application flows as well as trigger unexpected and
 * unwanted behaviors. Therefore if the NODE_ENV is not
 * 'development' we will return `undefined` and log a message
 * to the console instead of halting the execution thread.
 *
 * The config files are loaded in sequence: _shared.json, {env}.json, {env}.local.json
 *
 *
 * @see server/config/parser.js
 * @throws {ReferenceError} when key not defined in the config (NODE_ENV=development only)
 * @param {string} key name of the property defined in the config files
 * @returns {*} value of property named by the key
 */

const config = ( data ) => ( key ) => {
	if ( key in data ) {
		return data[ key ];
	}

	if ( 'development' === process.env.NODE_ENV ) {
		throw new ReferenceError(
			`Could not find config value for key '${ key }'\n` +
				"Please make sure that if you need it then it has a default value assigned in 'config/_shared.json'"
		);
	}

	// display console error only in a browser
	// (not in tests, for example)
	if ( 'undefined' !== typeof window ) {
		console.error(
			//eslint-disable-line no-console
			'%cCore Error: ' +
				'%cCould not find config value for key %c${ key }%c. ' +
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
};

/**
 * Checks whether a specific feature is enabled.
 *
 * @param {string} feature Feature name
 * @param {object} data the json environment configuration to use for getting config values
 * @returns {boolean} True when feature is enabled.
 * @api public
 */
const isEnabled = ( data ) => ( feature ) =>
	( data.features && !! data.features[ feature ] ) || false;

module.exports = ( data ) => {
	const configApi = config( data );
	configApi.isEnabled = isEnabled( data );

	return configApi;
};
