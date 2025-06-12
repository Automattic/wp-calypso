/**
 * WordPress dependencies
 */
import { useMemo, useState } from '@wordpress/element';
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
import DataForm from '../index';
import type { Field, Form } from '../../../types';

const meta = {
	title: 'DataViews/DataForm/Validation',
	component: DataForm,
	argTypes: {
		type: {
			control: { type: 'select' },
			description:
				'Chooses the default layout of each field. "regular" is the default layout.',
			options: [ 'default', 'regular', 'panel' ],
		},
		labelPosition: {
			control: { type: 'select' },
			description: 'Chooses the label position of the layout.',
			options: [ 'default', 'top', 'side', 'none' ],
		},
		minLength: {
			control: { type: 'number' },
			description: 'Minimum length for text fields',
			defaultValue: 2,
		},
		maxLength: {
			control: { type: 'number' },
			description: 'Maximum length for text fields',
			defaultValue: 10,
		},
	},
};
export default meta;

const DataFormWithValidation = ( {
	type,
	labelPosition,
	minLength,
	maxLength,
}: {
	type: 'default' | 'regular' | 'panel';
	labelPosition: 'default' | 'top' | 'side' | 'none';
	minLength: number;
	maxLength: number;
} ) => {
	const [ post, setPost ] = useState< {
		name: string;
		surname: string;
		email: string;
		job: string;
		experience: number;
		skills: string;
		notifications: boolean;
		role: string;
	} >( {
		name: 'John',
		surname: 'Doe',
		email: 'john.doe@example.com',
		job: 'developer',
		experience: 5,
		skills: 'JavaScript, React, WordPress',
		notifications: true,
		role: 'junior',
	} );

	const fields = useMemo(
		() =>
			[
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
							value: minLength,
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
							onChange={ ( value ) =>
								onChange( { [ field.id ]: value } )
							}
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
							value: minLength,
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
					type: 'select',
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
					type: 'number',
					Edit: ( { errorMessage, field, data, onChange } ) => (
						<ValidatedNumberControl
							label={ field.label }
							value={ field.getValue( { item: data } ) }
							onChange={ ( value: number | undefined | string ) =>
								onChange( { [ field.id ]: value } )
							}
							customValidator={ () => errorMessage }
							min={ 0 }
							max={ 50 }
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
					type: 'textarea',
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
					type: 'radio',
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
								console.log( 'value', value );
								if (
									value === 'lead' &&
									data.job === 'developer'
								) {
									return 'Lead role is not allowed';
								}

								return undefined;
							},
						},
					},
				},
			] as Field< {
				name: string;
				surname: string;
				email: string;
				job: string;
				experience: number;
				skills: string;
				notifications: boolean;
				role: string;
			} >[],
		[ minLength ]
	);

	const form = useMemo(
		() => ( {
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
		} ),
		[ type, labelPosition ]
	) as Form;

	return (
		<DataForm< {
			name: string;
			surname: string;
			email: string;
			job: string;
			experience: number;
			skills: string;
			notifications: boolean;
			role: string;
		} >
			fields={ fields }
			form={ form }
			data={ post }
			onChange={ ( edits ) =>
				setPost( ( prev ) => ( { ...prev, ...edits } ) )
			}
		/>
	);
};

export const withValidation = {
	title: 'DataViews/withValidation',
	render: DataFormWithValidation,
	argTypes: {
		...meta.argTypes,
	},
	args: {
		type: 'regular',
		minLength: 2,
		maxLength: 10,
	},
};
