/**
 * Internal dependencies
 */

import {
	EDITOR_CONTACT_FORM_CLEAR,
	EDITOR_CONTACT_FORM_LOAD,
	EDITOR_CONTACT_FORM_FIELD_ADD,
	EDITOR_CONTACT_FORM_FIELD_REMOVE,
	EDITOR_CONTACT_FORM_FIELD_UPDATE,
	EDITOR_CONTACT_FORM_SETTINGS_UPDATE,
} from 'state/action-types';

export function formClear() {
	return {
		type: EDITOR_CONTACT_FORM_CLEAR,
	};
}

export function formLoad( contactForm ) {
	return {
		type: EDITOR_CONTACT_FORM_LOAD,
		contactForm,
	};
}

export function fieldAdd() {
	return { type: EDITOR_CONTACT_FORM_FIELD_ADD };
}

export function fieldRemove( index ) {
	return {
		type: EDITOR_CONTACT_FORM_FIELD_REMOVE,
		index,
	};
}

export function fieldUpdate( index, field ) {
	return {
		type: EDITOR_CONTACT_FORM_FIELD_UPDATE,
		index,
		field,
	};
}

export function settingsUpdate( settings ) {
	return {
		type: EDITOR_CONTACT_FORM_SETTINGS_UPDATE,
		settings,
	};
}
