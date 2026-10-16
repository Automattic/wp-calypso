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

// import all rules in lib/rules
module.exports.rules = require( './rules' );
module.exports.configs = require( './configs' );

// Flat presets load their plugins on first use, so legacy-only users never need them.
for ( const name of Object.keys( flat ) ) {
	let built;
	Object.defineProperty( module.exports.configs, `flat/${ name }`, {
		enumerable: true,
		get: () => ( built ??= flat[ name ]( module.exports ) ),
	} );
}
