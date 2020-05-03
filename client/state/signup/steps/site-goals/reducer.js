/**
 * Internal dependencies
 */
import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_SITE_GOALS_SET } from 'state/action-types';

import { withSchemaValidation } from 'state/utils';
import { siteGoalsSchema } from './schema';

export default withSchemaValidation( siteGoalsSchema, ( state = '', action ) => {
	switch ( action.type ) {
		case SIGNUP_STEPS_SITE_GOALS_SET: {
			return action.siteGoals;
		}
		case SIGNUP_COMPLETE_RESET: {
			return '';
		}
	}

	return state;
} );
