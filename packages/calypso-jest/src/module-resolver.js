module.exports = function ( request, options ) {
	let conditions = options.conditions && [ 'calypso:src', ...options.conditions ];

	if ( request === '@mswjs/interceptors/presets/node' ) {
		return require.resolve( './mswjs-interceptors-node-preset.js' );
	}

	// The `parsel-js` package has a `browser` condition in `exports` field that points to an ESM module,
	// but the condition is matched also when requiring a CJS module.
	// `nock` needs the Node build of `@mswjs/interceptors`, even in JSDOM environments.
	if ( ( request === 'parsel-js' || request.startsWith( '@mswjs/interceptors' ) ) && conditions ) {
		conditions = conditions.filter( ( c ) => c !== 'browser' );
	}

	return options.defaultResolver( request, { ...options, conditions } );
};
