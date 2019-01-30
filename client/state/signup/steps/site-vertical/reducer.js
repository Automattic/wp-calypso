/** @format */
/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * Internal dependencies
 */

import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_SITE_VERTICAL_SET } from 'state/action-types';

import { createReducer } from 'state/utils';
import { siteVerticalSchema } from './schema';

const initialState = {
	isUserInput: true,
	name: '',
	slug: '',
	preview: '',
	id: '',
};

export default createReducer(
	initialState,
	{
		[ SIGNUP_STEPS_SITE_VERTICAL_SET ]: ( state, siteVerticalData ) => {
			return {
				...state,
				...omit( siteVerticalData, 'type' ),
			};
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return {};
		},
	},
	siteVerticalSchema
);
