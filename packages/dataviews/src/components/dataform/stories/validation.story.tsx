/**
 * WordPress dependencies
 */
import { useMemo, useState } from '@wordpress/element';
import { ValidatedTextControl } from '@automattic/components';

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
	} >( {
		name: 'John',
		surname: 'Doe',
	} );

	const fields = useMemo(
		() =>
			[
				{
					id: 'name',
					label: 'Name',
					type: 'text' as const,
					validationSchema: {
						minLength: 10,
						maxLength: 100,
					},
				},
				{
					id: 'surname',
					label: 'Surname',
					type: 'text',
					Edit: ( { errorMessage, field, data, onChange } ) => {
						const { id, label, placeholder, description } = field;
						const value = field.getValue( { item: data } );

						return (
							<ValidatedTextControl
								label={ label }
								placeholder={ placeholder }
								value={ value ?? '' }
								help={ description }
								onChange={ ( value ) =>
									onChange( { [ id ]: value } )
								}
								customValidator={ () => errorMessage }
							/>
						);
					},
					validationSchema: {
						minLength,
						maxLength,
					},
				},
			] as Field< { name: string; surname: string } >[],
		[ minLength, maxLength ]
	);

	const form = useMemo(
		() => ( {
			type,
			labelPosition,
			fields: [ 'name', 'surname' ],
		} ),
		[ type, labelPosition ]
	) as Form;

	return (
		<DataForm< { name: string; surname: string } >
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
