/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { SIGNUP_VERTICALS_SET } from 'state/action-types';

const verticals = createReducer(
	{},
	{
		[ SIGNUP_VERTICALS_SET ]: ( state, action ) => {
			return {
				...state,
				[ action.search.trim().toLowerCase() ]: action.verticals,
			};
		},
	}
);

export default verticals;
