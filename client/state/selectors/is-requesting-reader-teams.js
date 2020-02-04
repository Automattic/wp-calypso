/**
 * Internal dependencies
 */
import 'state/reader/reducer';

export default function isRequestingReaderTeams( state ) {
	return !! state.reader.teams.isRequesting;
}
