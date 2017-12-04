/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	JETPACK_ONBOARDING_SITE_DESCRIPTION_SET,
	JETPACK_ONBOARDING_SITE_TITLE_SET,
} from 'state/action-types';

export default createReducer(
	{},
	{
		[ JETPACK_ONBOARDING_SITE_DESCRIPTION_SET ]: ( state, { siteDescription } ) => ( {
			...state,
			siteDescription,
		} ),
		[ JETPACK_ONBOARDING_SITE_TITLE_SET ]: ( state, { siteTitle } ) => ( { ...state, siteTitle } ),
	}
);
