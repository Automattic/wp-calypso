import { createBlock, parse } from '@wordpress/blocks';

export function safeParse( text = '' ) {
	try {
		return parse( text );
	} catch {
		return [ createBlock( 'core/paragraph', { content: text } ) ];
	}
}
