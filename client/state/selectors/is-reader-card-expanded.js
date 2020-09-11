/**
 * Internal dependencies
 */
import { keyToString } from 'reader/post-key';

import 'state/reader-ui/init';

export default function isReaderCardExpanded( state, postKey ) {
	const key = keyToString( postKey );
	return !! ( key && state.readerUi.cardExpansions[ key ] );
}
