// Merges each own key of `source` into `object`, using `customizer` to decide
// the value for every key: `object[ key ] = customizer( object[ key ], source[
// key ], key )`. Callers here always return a value from the customizer, so
// there is no fall-through to a default deep merge. A source `__proto__` key is
// skipped (as lodash does) so it can never read from or merge into a prototype.
//
// `object` and `source` must both be non-null objects; the caller (mergeDeep)
// only recurses here once it has ruled out null and non-object values.
module.exports = function mergeWith( object, source, customizer ) {
	for ( const key of Object.keys( source ) ) {
		if ( key === '__proto__' ) {
			continue;
		}
		object[ key ] = customizer( object[ key ], source[ key ], key );
	}
	return object;
};
