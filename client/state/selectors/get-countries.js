export default function getCountries( state, type ) {
	return state.countries.items[ type ];
}
