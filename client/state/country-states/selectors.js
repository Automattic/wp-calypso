export function getCountryStates( state, countryCode ) {
	return state.countryStates.items[ countryCode ];
}

export function isCountryStatesFetching( state, countryCode ) {
	return state.countryStates.isFetching[ countryCode ];
}
