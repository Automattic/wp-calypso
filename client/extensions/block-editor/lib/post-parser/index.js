/**
 * Internal dependencies
 */
import { parse as pegParser } from './peg-parser';

const uid = ( function() {
	let id = 0;
	return function() {
		return id++;
	};
}() );

export function parse( postContent ) {
	try {
		return pegParser( postContent ).map( ( block ) => {
			const id = uid();
			return { ...block, id, key: `block-${ id }` };
		} );
	} catch ( e ) {
		return false;
	}
}

export function parseOne( blockRawContent ) {
	return parse( blockRawContent )[ 0 ];
}
