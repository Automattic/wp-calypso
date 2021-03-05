/**
 * Internal dependencies
 */
import { keyToString } from 'calypso/reader/post-key';

import 'calypso/state/reader-ui/init';

export default function isReaderCardExpanded( state, postKey ) {
	const key = keyToString( postKey );
	return !! ( key && state.readerUi.cardExpansions[ key ] );
}
