/**
 * External dependencies
 */
import React from 'react';
import warn from 'lib/warn';

export function renderComponent( component, props ) {
	switch ( typeof component ) {
		case 'undefined':
			return null;
		case 'function':
			return React.createElement( component, props );
		case 'object':
			return React.cloneElement( component, props );
		default:
			warn( 'Unrecognized component type: ' + ( typeof component ) );
			return null;
	}
}

export function renderField( fieldName, fieldModel, promotion, edit, currency ) {
	const { component, ...props } = fieldModel;

	return renderComponent( component, {
		...props,
		key: fieldName,
		value: promotion[ fieldName ],
		fieldName,
		edit,
		currency,
	} );
}

