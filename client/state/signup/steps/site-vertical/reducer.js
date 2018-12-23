/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_SITE_VERTICAL_SET } from 'state/action-types';

import { createReducer } from 'state/utils';
import { siteVerticalSchema } from './schema';

export default createReducer(
	{},
	{
		[ SIGNUP_STEPS_SITE_VERTICAL_SET ]: ( state, { name, slug } ) => {
			return {
				name,
				slug,
			};
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return {};
		},
	},
	siteVerticalSchema
);
