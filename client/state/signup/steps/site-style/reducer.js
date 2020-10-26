/**
 * Internal dependencies
 */
import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_SITE_STYLE_SET } from 'calypso/state/action-types';

import { withSchemaValidation } from 'calypso/state/utils';
import { siteStyleSchema } from './schema';

export default withSchemaValidation( siteStyleSchema, ( state = '', action ) => {
	switch ( action.type ) {
		case SIGNUP_STEPS_SITE_STYLE_SET: {
			return action.siteStyle;
		}
		case SIGNUP_COMPLETE_RESET: {
			return '';
		}
	}

	return state;
} );
