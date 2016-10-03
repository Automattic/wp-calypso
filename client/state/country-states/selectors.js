export function isCountryStatesListFetching( state ) {
	return state.countryStates.isFetching;
}

export function getCountryStatesList( state, country ) {
	return state.countryStates.countryStatesList[ country ];
}
