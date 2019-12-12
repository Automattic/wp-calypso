export default function isRequestingReaderTeams( state ) {
	return !! state.reader.teams.isRequesting;
}
