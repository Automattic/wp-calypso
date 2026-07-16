// Assigns `customizer( object[ key ], source[ key ], key )` for each own key of
// `source`; both must be non-null objects. Skips `__proto__` so
// it can never reach or pollute a prototype.
module.exports = function mergeWith( object, source, customizer ) {
	for ( const key of Object.keys( source ) ) {
		if ( key === '__proto__' ) {
			continue;
		}
		object[ key ] = customizer( object[ key ], source[ key ], key );
	}
	return object;
};
