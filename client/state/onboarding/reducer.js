/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { ONBOARDING_SET_TOKEN, ONBOARDING_SET_URL } from 'state/action-types';
import { onboardingSiteInfoSchema } from './schema';

export const siteInfo = createReducer(
	{},
	{
		[ ONBOARDING_SET_TOKEN ]: ( state, { token } ) => ( { ...state, token } ),
		[ ONBOARDING_SET_URL ]: ( state, { url } ) => ( { ...state, url } ),
	},
	onboardingSiteInfoSchema
);

export default combineReducers( {
	siteInfo,
} );
