/** @format */
/**
 * External dependencies
 */
import { toLower, trim } from 'lodash';

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
				[ trim( toLower( action.search ) ) ]: action.verticals,
			};
		},
	}
);

export default verticals;
