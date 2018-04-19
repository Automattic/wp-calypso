/**
 * /* eslint-disable no-console
 *
 * @format
 */

/**
 * External dependencies
 */
import { isFunction, partial } from 'lodash';

function wrapFnWithWarning( fn, name ) {
	const consoleFn = ( console.error || console.log ).bind( console );
	const hasWarned = new Set();
	return function() {
		if ( ! hasWarned.has( name ) ) {
			const err = new Error(
				`${ name } is not supported on all browsers. You must use a replacement method from lodash.`
			);
			consoleFn( err );
			hasWarned.add( name );
		}
		return fn.apply( this, arguments );
	};
}

function wrapObjectFn( obj, objectName, key ) {
	if ( isFunction( obj[ key ] ) ) {
		Object.defineProperty( obj, key, {
			value: wrapFnWithWarning( obj[ key ], `${ objectName }${ key }` ),
		} );
	}
}

export default function() {
	[ 'keys', 'entries', 'values', 'findIndex', 'fill', 'find', 'includes' ].map(
		partial( wrapObjectFn, Array.prototype, 'Array#' )
	);

	[ 'codePointAt', 'normalize', 'repeat', 'startsWith', 'endsWith', 'includes' ].map(
		partial( wrapObjectFn, String.prototype, 'String#' )
	);
}
