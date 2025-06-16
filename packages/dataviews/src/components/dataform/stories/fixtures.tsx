/**
 * WordPress dependencies
 */
import {
	ValidatedTextControl,
	ValidatedTextareaControl,
	ValidatedNumberControl,
	ValidatedSelectControl,
	ValidatedInputControl,
} from '@automattic/components';

/**
 * Internal dependencies
 */
import type { Field, Form } from '../../../types';

export type FormData = {
	name: string;
	surname: string;
	email: string;
	job: string;
	experience: number;
	skills: string;
	notifications: boolean;
	role: string;
};

export const initialData: FormData = {
	name: 'John',
	surname: 'Doe',
	email: 'john.doe@example.com',
	job: 'developer',
	experience: 5,
	skills: 'JavaScript, React, WordPress',
	notifications: true,
	role: 'junior',
};

export const getFields = (): Field< FormData >[] => [
	{
		id: 'name',
		label: 'First Name',
		type: 'text',
		Edit: ( { field, data, onChange } ) => (
			<ValidatedTextControl
				label={ field.label }
				value={ field.getValue( { item: data } ) }
				onChange={ ( value: string ) =>
					onChange( { [ field.id ]: value } )
				}
				customValidator={ () => {
					return field?.isValid?.( data )
						? undefined
						: 'Name must be longer than 5 characters';
				} }
			/>
		),
		isValid: ( item ) => {
			return item.name.length > 5;
		},
	},
	{
		id: 'surname',
		label: 'Last Name',
		type: 'text',
		Edit: ( { field, data, onChange } ) => (
			<ValidatedInputControl
				label={ field.label }
				value={ field.getValue( { item: data } ) }
				onChange={ ( value ) => onChange( { [ field.id ]: value } ) }
				customValidator={ () => {
					const isValid = field?.isValid?.( data );
					if ( typeof isValid === 'string' ) {
						return isValid;
					}

					return undefined;
				} }
			/>
		),
		isValid: {
			isRequired: true,
		},
	},
	{
		id: 'email',
		label: 'Email Address',
		type: 'email',
		Edit: ( { field, data, onChange } ) => (
			<ValidatedTextControl
				label={ field.label }
				value={ field.getValue( { item: data } ) }
				onChange={ ( value: string ) =>
					onChange( { [ field.id ]: value } )
				}
				customValidator={ () => {
					const isValid = field?.isValid?.( data );

					if ( typeof isValid === 'boolean' ) {
						return isValid ? undefined : 'Email is not valid';
					}

					return isValid;
				} }
				type="email"
			/>
		),
		isValid: ( item ) => {
			return item.email.includes( '@' );
		},
	},
];

export const getForm = (
	type: 'regular' | 'panel',
	labelPosition: 'top' | 'side' | 'none'
): Form => ( {
	type,
	labelPosition,
	fields: [ 'name', 'surname', 'email' ],
} );
