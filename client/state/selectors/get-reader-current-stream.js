/**
 * Internal dependencies
 */
import 'state/reader-ui/init';

export default function getCurrentStream( state ) {
	return state.readerUi.currentStream;
}
