import {
	SIGNUP_STEPS_DIFM_SELECT_DIFM_CATEGORY,
	SIGNUP_STEPS_DIFM_SUBMIT_TYPEFORM,
} from 'calypso/state/action-types';
import { withSchemaValidation } from 'calypso/state/utils';
import { difmLiteSchema } from './schema';

export const defaultValue = {
	selectedDIFMCategory: '',
	typeformResponseId: '',
};
export default withSchemaValidation( difmLiteSchema, ( state = defaultValue, action ) => {
	switch ( action.type ) {
		case SIGNUP_STEPS_DIFM_SELECT_DIFM_CATEGORY: {
			return {
				...state,
				selectedDIFMCategory: action.selectedDIFMCategory,
			};
		}
		case SIGNUP_STEPS_DIFM_SUBMIT_TYPEFORM: {
			return {
				...state,
				typeformResponseId: action.typeformResponseId,
			};
		}
		default:
			return state;
	}
} );
