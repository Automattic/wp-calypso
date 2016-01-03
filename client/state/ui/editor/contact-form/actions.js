/**
 * Internal dependencies
 */
import {
	EDITOR_CONTACT_FORM_LOAD_FORM,
	EDITOR_CONTACT_FORM_ADD_DEFAULT_FIELD,
	EDITOR_CONTACT_FORM_REMOVE_FIELD,
	EDITOR_CONTACT_FORM_CLEAR_FORM
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that a contact form dialog
 * has to be initialized.
 *
 * @param  {Object} contactForm
 * @return {Object} Action object
 */
export function loadForm( contactForm ) {
	return {
		type: EDITOR_CONTACT_FORM_LOAD_FORM,
		contactForm
	};
}

export function addDefaultField() {
	return { type: EDITOR_CONTACT_FORM_ADD_DEFAULT_FIELD };
}

export function removeField( index ) {
	return {
		type: EDITOR_CONTACT_FORM_REMOVE_FIELD,
		index
	}
}

export function clearForm() {
	return {
		type: EDITOR_CONTACT_FORM_CLEAR_FORM
	}
}
