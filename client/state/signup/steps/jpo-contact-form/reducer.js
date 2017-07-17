/**
 * Internal dependencies
 */
import {
	SIGNUP_COMPLETE_RESET,
	SIGNUP_STEPS_JPO_CONTACT_FORM_SET,
} from 'state/action-types';

import { createReducer } from 'state/utils';
import { jpoContactFormSchema } from './schema';

export default createReducer( '',
	{
		[ SIGNUP_STEPS_JPO_CONTACT_FORM_SET ]: ( state = '', action ) => {
			return action.contactForm;
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return '';
		},
	},
	jpoContactFormSchema
);