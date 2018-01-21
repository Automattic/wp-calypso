/**
 * Internal dependencies
 */
export const SET_FORM_PROPERTY = 'SET_FORM_PROPERTY';
export const SET_ALL_PRISTINE = 'SET_ALL_PRISTINE';

export const setFormProperty = ( field, value ) => {
	return {
		type: SET_FORM_PROPERTY,
		field,
		value,
	};
};

export const setAllPristine = ( pristineValue ) => ( {
	type: SET_ALL_PRISTINE,
	pristineValue,
} );
