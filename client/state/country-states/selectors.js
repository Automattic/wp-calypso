export function getCountryStates( state, countryCode ) {
	return state.countryStates.items[ countryCode.toLowerCase() ];
}

export function isCountryStatesFetching( state, countryCode ) {
	return state.countryStates.isFetching[ countryCode.toLowerCase() ];
}
