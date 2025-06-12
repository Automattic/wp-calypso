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
		Edit: ( { errorMessage, field, data, onChange } ) => (
			<ValidatedTextControl
				label={ field.label }
				value={ field.getValue( { item: data } ) }
				onChange={ ( value: string ) =>
					onChange( { [ field.id ]: value } )
				}
				customValidator={ () => errorMessage }
			/>
		),
		rules: {
			required: {
				message: 'First name is required',
				value: true,
			},
			minLength: {
				message: 'Minimum length is 2',
				value: 2,
			},
		},
	},
	{
		id: 'surname',
		label: 'Last Name',
		type: 'text',
		Edit: ( { errorMessage, field, data, onChange } ) => (
			<ValidatedInputControl
				label={ field.label }
				value={ field.getValue( { item: data } ) }
				onChange={ ( value ) => onChange( { [ field.id ]: value } ) }
				customValidator={ () => errorMessage }
			/>
		),
		rules: {
			required: {
				message: 'Last name is required',
				value: true,
			},
			minLength: {
				message: 'Minimum length is 2',
				value: 2,
			},
		},
	},
	{
		id: 'email',
		label: 'Email Address',
		type: 'email',
		Edit: ( { errorMessage, field, data, onChange } ) => (
			<ValidatedTextControl
				label={ field.label }
				value={ field.getValue( { item: data } ) }
				onChange={ ( value: string ) =>
					onChange( { [ field.id ]: value } )
				}
				customValidator={ () => errorMessage }
				type="email"
			/>
		),
		rules: {
			required: {
				message: 'Email is required',
				value: true,
			},
		},
	},
	{
		id: 'job',
		label: 'Job Role',
		Edit: ( { errorMessage, field, data, onChange } ) => (
			<ValidatedSelectControl
				label={ field.label }
				value={ field.getValue( { item: data } ) }
				onChange={ ( value: string ) =>
					onChange( { [ field.id ]: value } )
				}
				customValidator={ () => errorMessage }
				options={ [
					{ label: 'Developer', value: 'developer' },
					{ label: 'Designer', value: 'designer' },
					{
						label: 'Product Manager',
						value: 'product_manager',
					},
				] }
			/>
		),
		rules: {
			required: {
				message: 'Please select a job role',
				value: true,
			},
		},
	},
	{
		id: 'experience',
		label: 'Years of Experience',
		Edit: ( { errorMessage, field, data, onChange } ) => (
			<ValidatedNumberControl
				label={ field.label }
				value={ field.getValue( { item: data } ) }
				onChange={ ( value: number | undefined | string ) =>
					onChange( { [ field.id ]: value } )
				}
				customValidator={ () => errorMessage }
			/>
		),
		rules: {
			required: {
				message: 'Please enter your years of experience',
				value: true,
			},
			min: {
				message: 'Experience cannot be negative',
				value: 0,
			},
			max: {
				message: 'Experience cannot exceed 50 years',
				value: 50,
			},
		},
	},
	{
		id: 'skills',
		label: 'Skills',
		Edit: ( { errorMessage, field, data, onChange } ) => (
			<ValidatedTextareaControl
				label={ field.label }
				value={ field.getValue( { item: data } ) }
				onChange={ ( value: string ) =>
					onChange( { [ field.id ]: value } )
				}
				customValidator={ () => errorMessage }
			/>
		),
		rules: {
			required: {
				message: 'Please list your skills',
				value: true,
			},
		},
	},
	{
		id: 'role',
		label: 'Current Role',
		Edit: ( { errorMessage, field, data, onChange } ) => (
			<ValidatedSelectControl
				label={ field.label }
				value={ field.getValue( { item: data } ) }
				onChange={ ( value: string ) => {
					onChange( { [ field.id ]: value } );
				} }
				customValidator={ () => {
					return errorMessage;
				} }
				options={ [
					{ label: 'Junior', value: 'junior' },
					{ label: 'Mid-level', value: 'mid' },
					{ label: 'Senior', value: 'senior' },
					{ label: 'Lead', value: 'lead' },
				] }
			/>
		),
		rules: {
			validate: {
				callback: ( value, field, data ) => {
					if ( value === 'lead' && data.job === 'developer' ) {
						return 'Lead role is not allowed';
					}

					return undefined;
				},
			},
		},
	},
];

export const getForm = (
	type: 'regular' | 'panel',
	labelPosition: 'top' | 'side' | 'none'
): Form => ( {
	type,
	labelPosition,
	fields: [
		'name',
		'surname',
		'email',
		'job',
		'experience',
		'skills',
		'notifications',
		'role',
	],
} );
