/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { SIGNUP_VERTICALS_SET } from 'state/action-types';

export default createReducer( null, {
	[ SIGNUP_VERTICALS_SET ]: ( state, action ) => {
		const siteType = action.siteType.trim().toLowerCase();
		const previousData = state ? state[ siteType ] : {};
		return {
			...state,
			[ siteType ]: {
				...previousData,
				[ action.search.trim().toLowerCase() ]: action.verticals,
			},
		};
	},
} );
