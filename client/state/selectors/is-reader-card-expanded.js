/**
 * Internal dependencies
 */

import { keyToString } from 'reader/post-key';

export default function isReaderCardExpanded( state, postKey ) {
	const key = keyToString( postKey );
	return !! ( key && state.ui.reader.cardExpansions[ key ] );
}
