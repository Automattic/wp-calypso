export const CONTACT_FORM_FIELD_TYPES = {
	name: 'name',
	email: 'email',
	url: 'url',
	checkbox: 'checkbox',
	dropdown: 'dropdown',
	radio: 'radio',
	text: 'text',
	textarea: 'textarea',
	website: 'website'
};

export const CONTACT_FORM_DEFAULT = {
	fields: [
		{ label: 'Name', type: CONTACT_FORM_FIELD_TYPES.name, required: true },
		{ label: 'Email', type: CONTACT_FORM_FIELD_TYPES.email, required: true },
		{ label: 'Website', type: CONTACT_FORM_FIELD_TYPES.url },
		{ label: 'Comment', type: CONTACT_FORM_FIELD_TYPES.textarea, required: true }
	]
};

export const CONTACT_FORM_DEFAULT_NEW_FIELD = {
	label: 'Text',
	type: CONTACT_FORM_FIELD_TYPES.text
};
