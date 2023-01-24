/**
 * Set a (nested) value in an object. Will create keys if they're not existent.
 *
 * @param {Object} obj Object to operate on
 * @param {string | Array} path Key to set. Can be an array to represent nested values
 * @param {string} value Value which key should be set to
 */
export function setValue( obj, path, value ) {
	if ( ! Array.isArray( path ) ) {
		path = [ path ];
	}
	function doSet( o = {}, i ) {
		return {
			...o,
			[ path[ i ] ]: i === path.length - 1 ? value : doSet( o[ path[ i ] ], i + 1 ),
		};
	}
	return doSet( obj, 0 );
}

/**
 * Remove a (nested) value from an object. It will clean up empty objects in the tree.
 *
 * @param {Object} obj Object to operate on
 * @param {string | Array} path Key to remove. Can be an array to represent nested values
 */
export function removeValue( obj, path ) {
	if ( ! Array.isArray( path ) ) {
		path = [ path ];
	}
	function doRemove( o, i ) {
		if ( ! o ) {
			return {};
		}
		if ( i < path.length - 1 ) {
			const r = doRemove( o[ path[ i ] ], i + 1 );
			if ( Object.keys( r ).length > 0 ) {
				return { ...o, [ path[ i ] ]: r };
			}
		}
		const { [ path[ i ] ]: r, ...or } = o;
		return or;
	}
	return doRemove( obj, 0 );
}
