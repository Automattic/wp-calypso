export function getStatesList( state, countryCode ) {
	return state.statesList.items[ countryCode ];
}

export function isStatesListFetching( state, countryCode ) {
	return state.statesList.isFetching[ countryCode ];
}
