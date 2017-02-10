/**
 * Manages config flags for various deployment builds
 * @module config/index
 */

if ( 'undefined' === typeof window ||  ! window.config ) {
	throw new ReferenceError( `No configuration was found: please see client/config/README.md for more information` );
}

/**
 * @typedef {Function} CalypsoConfig - retrieves property from config
 * @property {Function} anyEnabled whether one of a set of properties is enabled
 * @property {Function} isEnabled whether a specific property is enabled
 */
const config = window.config;
config.isEnabled = window.isEnabled;
config.anyEnabled = window.anyEnabled;

export default config;
