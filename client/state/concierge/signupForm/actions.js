/** @format */

/**
 * Internal dependencies
 */
import { CONCIERGE_SIGNUP_FORM_UPDATE } from 'state/action-types';

export const updateConciergeSignupForm = signupForm => ( {
	type: CONCIERGE_SIGNUP_FORM_UPDATE,
	signupForm,
} );
