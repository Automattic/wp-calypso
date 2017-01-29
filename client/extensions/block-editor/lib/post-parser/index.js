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

function key( id ) {
	return `block-${ id }`;
}

export function parse( postContent ) {
	try {
		return pegParser( postContent ).map( ( block ) => {
			const id = uid();
			return { ...block, id, key: key( id ) };
		} );
	} catch ( e ) {
		return false;
	}
}

export function parseOne( blockRawContent, blockId ) {
	try {
		return {
			...pegParser( blockRawContent )[ 0 ],
			id: blockId,
			key: key( blockId ),
		};
	} catch ( e ) {
		return false;
	}
}
