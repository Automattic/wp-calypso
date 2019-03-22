/** @format */
/**
 * External dependencies
 */
// import { omit } from 'lodash';

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

export default createReducer(
	initialState,
	{
		[ SIGNUP_STEPS_SITE_VERTICAL_SET ]: ( state, siteVerticalData ) => {
			// return {
			// 	...state,
			// 	...omit( siteVerticalData, 'type' ),
			// };
			return {
				name: siteVerticalData.name,
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
