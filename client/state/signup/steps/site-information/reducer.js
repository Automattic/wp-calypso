/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_SITE_INFORMATION_SET } from 'state/action-types';

import { createReducer } from 'state/utils';
import { siteInformationSchema } from './schema';

const initialState = {
	address: '',
	phone: '',
	title: '',
};

export default createReducer(
	initialState,
	{
		[ SIGNUP_STEPS_SITE_INFORMATION_SET ]: ( state, { data } ) => {
			return {
				...state,
				...data,
			};
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return {};
		},
	},
	siteInformationSchema
);
