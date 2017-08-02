/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_JPO_CONTACT_FORM_SET } from 'state/action-types';

export function setJPOContactForm( contactForm ) {
	console.log( 'setJPOContactForm: ', contactForm );

	return {
		type: SIGNUP_STEPS_JPO_CONTACT_FORM_SET,
		contactForm
	};
}