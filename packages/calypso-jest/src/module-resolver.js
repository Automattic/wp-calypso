module.exports = function ( request, options ) {
	const conditions = options.conditions && [ 'calypso:src', ...options.conditions ];
	return options.defaultResolver( request, { ...options, conditions } );
};
