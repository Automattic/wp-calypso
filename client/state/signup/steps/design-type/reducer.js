/**
 * Internal dependencies
 */
import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_DESIGN_TYPE_SET } from 'calypso/state/action-types';

import { withSchemaValidation } from 'calypso/state/utils';
import { designTypeSchema } from './schema';

export default withSchemaValidation( designTypeSchema, ( state = '', action ) => {
	switch ( action.type ) {
		case SIGNUP_STEPS_DESIGN_TYPE_SET: {
			return action.designType;
		}
		case SIGNUP_COMPLETE_RESET: {
			return '';
		}
	}

	return state;
} );
