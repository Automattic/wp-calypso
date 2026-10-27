/**
 * @file ESLint rules for the WordPress.com Calypso project
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

const flat = require( './configs/flat' );

module.exports.meta = {
	name: 'eslint-plugin-wpcalypso',
	version: require( '../package.json' ).version,
};

// import all rules in lib/rules
module.exports.rules = require( './rules' );
module.exports.configs = {};

// Built on first use: they reference this plugin object, and `react` loads the optional React
// plugins, which `recommended` users may not have.
for ( const name of Object.keys( flat ) ) {
	let built;
	const get = () => ( built ??= flat[ name ]( module.exports ) );
	Object.defineProperty( module.exports.configs, name, { enumerable: true, get } );
}
