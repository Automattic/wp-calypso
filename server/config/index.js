const path = require( 'path' );

const configPath = path.resolve( __dirname, '..', '..', 'config' );
const data = require( './parser' )( configPath, {
	env: process.env.CALYPSO_ENV || process.env.NODE_ENV || 'development',
	includeSecrets: true,
	enabledFeatures: process.env.ENABLE_FEATURES,
	disabledFeatures: process.env.DISABLE_FEATURES
} );

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
 * @see server/config/parser.js
 *
 * @throws {ReferenceError} when key not defined in the config (NODE_ENV=development only)
 * @param {String} key name of the property defined in the config files
 * @returns {*} value of property named by the key
 */
function config( key ) {
	if ( key in data ) {
		return data[ key ];
	}

	const errorMessage = (
		`Could not find config value for key '${ key }'\n` +
		`Please make sure that if you need it then it has a value assigned in 'config/_shared.json'`
	);

	if ( 'development' === process.env.NODE_ENV ) {
		throw new ReferenceError( errorMessage );
	}

	// display console error only in a browser
	// (not in tests, for example)
	if ( 'undefined' !== typeof window ) {
		console.error( errorMessage );
	}
}

function isEnabled( feature ) {
	return !! data.features[ feature ];
}

function anyEnabled() {
	var args = Array.prototype.slice.call( arguments );
	return args.some( function( feature ) {
		return isEnabled( feature );
	} );
}

module.exports = config;
module.exports.isEnabled = isEnabled;
module.exports.anyEnabled = anyEnabled;
