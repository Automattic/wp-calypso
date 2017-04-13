/**
 * External dependencies
 */
import { forOwn } from 'lodash';

export function createFormAndSubmit( url, formData ) {
	const form = document.createElement( 'form' );
	form.setAttribute( 'method', 'POST' );
	form.setAttribute( 'action', url );

	forOwn( formData, ( value, name ) => {
		const field = document.createElement( 'input' );
		field.setAttribute( 'type', 'hidden' );
		field.setAttribute( 'name', name );
		field.setAttribute( 'value', value );
		form.appendChild( field );
	} );

	document.body.appendChild( form );
	form.submit();
}
