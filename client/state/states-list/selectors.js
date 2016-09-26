export function getStatesList( state, countryCode ) {
	return state.statesList[ countryCode ];
}

export function isStatesListFetching( state ) {
	return state.statesList.isFetching;
}
