/**
 * Internal dependencies
 */
import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_SITE_TYPE_SET } from 'calypso/state/action-types';

import { withSchemaValidation } from 'calypso/state/utils';
import { siteTypeSchema } from './schema';

export default withSchemaValidation( siteTypeSchema, ( state = '', action ) => {
	switch ( action.type ) {
		case SIGNUP_STEPS_SITE_TYPE_SET: {
			return action.siteType;
		}
		case SIGNUP_COMPLETE_RESET: {
			return '';
		}
	}

	return state;
} );
