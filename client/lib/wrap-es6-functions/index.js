/**
 * External dependencies
 */
import { partial, isFunction } from 'lodash';

function wrapFnWithWarning( fn, name ) {
	return function() {
		/* eslint-disable no-console */
		if ( typeof console !== 'undefined' && console.log ) {
			console.log(
				`%c${ name } is not supported on all browsers. ` + 'We currently ' +
				'do not polyfill prototype methods due to bundle size concerns. ' +
				'You must use a replacement method from lodash. ' +
				'See: https://github.com/Automattic/wp-calypso/pull/6117',
				'background: yellow; font-size: x-large'
			);
		}
		/* eslint-enable no-console */
		return fn.apply( this, arguments );
	};
}

function wrapObjectFn( obj, objectName, key ) {
	if ( isFunction( obj[ key ] ) ) {
		Object.defineProperty( obj, key, { value: wrapFnWithWarning( obj[ key ], `${ objectName }${ key }` ) } );
	}
}

export default function() {
	[ 'keys', 'entries', 'values', 'findIndex', 'fill', 'find' ]
		.map( partial( wrapObjectFn, Array.prototype, 'Array#' ) );

	[ 'codePointAt', 'normalize', 'repeat', 'startsWith', 'endsWith', 'includes' ]
		.map( partial( wrapObjectFn, String.prototype, 'String#' ) );

	[ 'flags' ].map( partial( wrapObjectFn, RegExp.prototype, 'RegExp#' ) );
}
