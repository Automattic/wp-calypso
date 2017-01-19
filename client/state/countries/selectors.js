export function getCountries( state, type ) {
	return state.countries.items[ type ];
}

export function isFetching( state, type ) {
	return state.countries.isFetching[ type ];
}
