/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */

export function toValidId( val ) {
	if ( val === true ) {
		return undefined;
	}
	const id = Number( val );
	if ( Math.floor( id ) !== id ) {
		return undefined;
	}
	return id !== 0 && ! isNaN( id )
		? id
		: undefined;
}
