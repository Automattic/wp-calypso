/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { SIGNUP_VERTICALS_SET } from 'state/action-types';

export default createReducer( null, {
	[ SIGNUP_VERTICALS_SET ]: ( state, action ) => {
		const siteTypeId = action.siteTypeId;
		const previousData = state ? state[ siteTypeId ] : {};
		return {
			...state,
			[ siteTypeId ]: {
				...previousData,
				[ action.search.trim().toLowerCase() ]: action.verticals,
			},
		};
	},
} );
