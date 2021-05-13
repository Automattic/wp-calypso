/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import { JETPACK_CONNECT_AUTHORIZE } from 'calypso/state/jetpack-connect/action-types';
import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_SITE_VERTICAL_SET } from 'calypso/state/action-types';
import { withSchemaValidation } from 'calypso/state/utils';
import { siteVerticalSchema } from './schema';

const initialState = {
	id: '',
	isUserInput: true,
	name: '',
	parentId: '',
	slug: '',
	preview: '',
	suggestedTheme: '',
};

// TODO:
// This reducer can be further simplify since the verticals data can be
// found in `signup.verticals`, so it only needs to store the site vertical name.
export default withSchemaValidation( siteVerticalSchema, ( state = initialState, action ) => {
	switch ( action.type ) {
		case SIGNUP_STEPS_SITE_VERTICAL_SET:
			return {
				...state,
				...omit( action, 'type' ),
			};
		case SIGNUP_COMPLETE_RESET: {
			return {};
		}
		case JETPACK_CONNECT_AUTHORIZE: {
			return {};
		}
	}

	return state;
} );
