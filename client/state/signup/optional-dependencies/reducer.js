import {
	SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET,
	SIGNUP_OPTIONAL_DEPENDENCY_SITE_ACCENT_COLOR,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { siteAccentColorSchema, suggestedUsernameSchema } from './schema';

const suggestedUsername = withSchemaValidation( suggestedUsernameSchema, ( state = '', action ) => {
	switch ( action.type ) {
		case SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET: {
			return action.data;
		}
	}

	return state;
} );

const siteAccentColor = withSchemaValidation( siteAccentColorSchema, ( state = '', action ) =>
	action.type === SIGNUP_OPTIONAL_DEPENDENCY_SITE_ACCENT_COLOR ? action.data : state
);

export default combineReducers( {
	suggestedUsername,
	siteAccentColor,
} );
