/** @format */
/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import {
	JETPACK_CONNECT_AUTHORIZE,
	SIGNUP_COMPLETE_RESET,
	SIGNUP_STEPS_SITE_VERTICAL_SET,
} from 'state/action-types';
import { createReducer } from 'state/utils';
import { siteVerticalSchema } from './schema';

const initialState = {
	id: '',
	isUserInput: true,
	name: '',
	parentId: '',
	slug: '',
	preview: '',
};

// TODO:
// This reducer can be further simplify since the verticals data can be
// found in `signup.verticals`, so it only needs to store the site vertical name.
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
		[ JETPACK_CONNECT_AUTHORIZE ]: () => {
			return {};
		},
	},
	siteVerticalSchema
);
