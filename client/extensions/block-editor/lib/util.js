/**
 * External dependencies
 */
import { get } from 'lodash';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:block-editor:util' );

export function tryOr( fn, failureValue ) {
	let result;
	try {
		result = fn();
	} catch ( e ) {
		debug( 'tryOr', e );
		result = failureValue;
	}
	return result;
}

export function findText( props ) {
	const textNode = deepFind( props, n => n.type === 'Text' );
	return unescape( get( textNode, 'value', '' ) );
}

export function deepFind( node, predicate ) {
	if ( node && predicate( node ) ) {
		return node;
	}

	if ( ! node || ! node.children ) {
		return;
	}

	for ( let i = 0; i < node.children.length; i++ ) {
		const result = deepFind( node.children[ i ], predicate );
		if ( result ) {
			return result;
		}
	}
}
