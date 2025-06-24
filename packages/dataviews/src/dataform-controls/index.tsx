/**
 * External dependencies
 */
import type { ComponentType } from 'react';

/**
 * Internal dependencies
 */
import type { Field, FieldTypeDefinition } from '../types';
import boolean from './boolean';
import checkbox from './checkbox';
import datetime from './datetime';
import email from './email';
import integer from './integer';
import radio from './radio';
import select from './select';
import text from './text';
import toggleGroup from './toggle-group';
import {
	DataFormControlPropsWithConstraints,
	injectConstraintsProp,
} from '../components/validation';

interface FormControls {
	[ key: string ]: ComponentType<
		DataFormControlPropsWithConstraints< any >
	>;
}

const FORM_CONTROLS: FormControls = {
	boolean,
	checkbox,
	datetime,
	email,
	integer,
	radio,
	select,
	text,
	toggleGroup,
};

export function getControl< Item >(
	field: Field< Item >,
	fieldTypeDefinition: FieldTypeDefinition< Item >
) {
	if ( typeof field.Edit === 'function' ) {
		return field.Edit;
	}

	if ( typeof field.Edit === 'string' ) {
		return getControlByType( field.Edit );
	}

	if ( field.elements ) {
		return getControlByType( 'select' );
	}

	if ( typeof fieldTypeDefinition.Edit === 'string' ) {
		return injectConstraintsProp(
			getControlByType( fieldTypeDefinition.Edit ),
			field.isValid
		);
	}

	return fieldTypeDefinition.Edit;
}

export function getControlByType( type: string ) {
	if ( Object.keys( FORM_CONTROLS ).includes( type ) ) {
		return FORM_CONTROLS[ type ];
	}

	throw 'Control ' + type + ' not found';
}
