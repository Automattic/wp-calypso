module.exports = function ( request, options ) {
	let conditions = options.conditions && [ 'calypso:src', ...options.conditions ];

	// The `parsel-js` package has a `browser` condition in `exports` field that points to an ESM module,
	// but the condition is matched also when requiring a CJS module.
	if ( request === 'parsel-js' && conditions ) {
		conditions = conditions.filter( ( c ) => c !== 'browser' );
	}

	return options.defaultResolver( request, { ...options, conditions } );
};
