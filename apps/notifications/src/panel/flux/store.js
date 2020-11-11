/**
 * Module variables
 */
const state = { global: {} };

const store = {
	get( item ) {
		if ( item ) {
			return state[ item ];
		}

		return state;
	},
};

export default store;
