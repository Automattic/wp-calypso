const flat = require( './configs/flat' );

module.exports.meta = {
	name: '@automattic/eslint-plugin-json',
	version: require( '../package.json' ).version,
};

module.exports.rules = require( './rules' );
module.exports.configs = {};

// Built on first use, since they reference this plugin object.
for ( const name of Object.keys( flat ) ) {
	let built;
	Object.defineProperty( module.exports.configs, name, {
		enumerable: true,
		get: () => ( built ??= flat[ name ]( module.exports ) ),
	} );
}
