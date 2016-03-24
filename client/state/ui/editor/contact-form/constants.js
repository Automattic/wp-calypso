export const CONTACT_FORM_FIELD_TYPES = {
	name: 'name',
	email: 'email',
	checkbox: 'checkbox',
	dropdown: 'select',
	radio: 'radio',
	text: 'text',
	textarea: 'textarea',
	website: 'url'
};

export const CONTACT_FORM_DEFAULT = {
	fields: [
		{ label: 'Name', type: CONTACT_FORM_FIELD_TYPES.name, required: true },
		{ label: 'Email', type: CONTACT_FORM_FIELD_TYPES.email, required: true },
		{ label: 'Website', type: CONTACT_FORM_FIELD_TYPES.website },
		{ label: 'Comment', type: CONTACT_FORM_FIELD_TYPES.textarea, required: true }
	]
};

export const CONTACT_FORM_DEFAULT_NEW_FIELD = {
	label: 'Text',
	type: CONTACT_FORM_FIELD_TYPES.text,
	isExpanded: true
};
