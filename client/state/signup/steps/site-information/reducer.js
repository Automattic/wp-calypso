/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_SITE_INFORMATION_SET } from 'state/action-types';

import { createReducer } from 'state/utils';
import { siteInformationSchema } from './schema';

export default createReducer(
	{},
	{
		[ SIGNUP_STEPS_SITE_INFORMATION_SET ]: ( state, { name, address, phone } ) => {
			return {
				name,
				address,
				phone,
			};
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return {};
		},
	},
	siteInformationSchema
);
