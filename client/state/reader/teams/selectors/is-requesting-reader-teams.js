/**
 * Internal dependencies
 */
import 'calypso/state/reader/init';

export default function isRequestingReaderTeams( state ) {
	return !! state.reader.teams.isRequesting;
}
