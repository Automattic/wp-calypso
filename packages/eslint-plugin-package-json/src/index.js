const flat = require( './configs/flat' );

module.exports.meta = {
	name: '@automattic/eslint-plugin-json',
	version: require( '../package.json' ).version,
};

module.exports.rules = require( './rules' );
module.exports.configs = require( './configs' );

// Built on first use, like the legacy presets that ESLint loads by name.
for ( const name of Object.keys( flat ) ) {
	let built;
	Object.defineProperty( module.exports.configs, `flat/${ name }`, {
		enumerable: true,
		get: () => ( built ??= flat[ name ]( module.exports ) ),
	} );
}
