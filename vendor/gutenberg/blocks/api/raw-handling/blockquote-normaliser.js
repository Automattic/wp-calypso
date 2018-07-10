/**
 * Internal dependencies
 */
import normaliseBlocks from './normalise-blocks';

export default function( node ) {
	if ( node.nodeName !== 'BLOCKQUOTE' ) {
		return;
	}

	node.innerHTML = normaliseBlocks( node.innerHTML );
}
