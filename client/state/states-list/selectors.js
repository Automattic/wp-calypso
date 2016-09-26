export function getStatesList( state, countryCode ) {
	return state.statesList.statesList[ countryCode ];
}

export function isStatesListFetching( state, countryCode ) {
	return state.statesList.isFetching[ countryCode ];
}
