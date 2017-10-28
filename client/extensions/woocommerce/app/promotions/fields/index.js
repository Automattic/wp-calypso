/**
 * External dependencies
 */
import React from 'react';
import warn from 'lib/warn';

export function renderField( fieldName, fieldModel, promotion, edit, currency ) {
	const { component, labelText, explanationText, placeholderText, isRequired } = fieldModel;

	const props = {
		key: fieldName,
		fieldName,
		labelText,
		explanationText,
		placeholderText,
		isRequired,
		value: promotion[ fieldName ],
		edit,
		currency,
	};

	switch ( typeof component ) {
		case 'function':
			return React.createElement( component, props );
		case 'object':
			return React.cloneElement( component, props );
		default:
			warn( 'Unrecognized model.component type: ' + ( typeof component ) );
			return null;
	}
}

