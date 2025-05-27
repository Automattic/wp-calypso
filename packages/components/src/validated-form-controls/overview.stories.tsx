import { DataForm } from '@automattic/dataviews';
import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ValidatedInputControl } from './components/input-control';
import { formDecorator } from './components/story-utils';
import { ValidatedTextControl } from './components/text-control';
import { ValidatedTextareaControl } from './components/textarea-control';
import { ControlWithError } from './control-with-error';
import type { Field, Form, DataFormControlProps, NormalizedField } from '@automattic/dataviews';

const meta: Meta< typeof ControlWithError > = {
	title: 'Validated Form Controls/Overview',
	decorators: formDecorator,
	tags: [ '!dev' ],
};
export default meta;

type Story = StoryObj< typeof ControlWithError >;

/**
 * When there are multiple controls with errors, attempting to submit will
 * move focus to the first control with an error.
 */
export const WithMultipleControls: Story = {
	render: function Template() {
		const [ text, setText ] = useState( '' );
		const [ text2, setText2 ] = useState( '' );

		return (
			<>
				<ValidatedInputControl
					label="Text"
					required
					value={ text }
					help="The word 'error' will trigger an error."
					customValidator={ ( value ) => {
						if ( value?.toLowerCase() === 'error' ) {
							return 'The word "error" is not allowed.';
						}
					} }
					onChange={ ( value ) => setText( value ?? '' ) }
				/>
				<ValidatedInputControl
					label="Text"
					required
					value={ text2 }
					help="The word 'error' will trigger an error."
					customValidator={ ( value ) => {
						if ( value?.toLowerCase() === 'error' ) {
							return 'The word "error" is not allowed.';
						}
					} }
					onChange={ ( value ) => setText2( value ?? '' ) }
				/>
			</>
		);
	},
};

/**
 * Help text can be configured to be hidden when a custom error is reported. Whether to opt for this approach
 * will depend on context.
 */
export const WithHelpTextReplacement: Story = {
	render: function Template() {
		const [ text, setText ] = useState( '' );
		const [ hasCustomError, setHasCustomError ] = useState( false );

		return (
			<ValidatedInputControl
				label="Text"
				required
				value={ text }
				help={ hasCustomError ? undefined : 'The word "error" is not allowed.' }
				customValidator={ ( value ) => {
					if ( value?.toLowerCase() === 'error' ) {
						setHasCustomError( true );
						return 'The word "error" is not allowed.';
					}
					setHasCustomError( false );
				} }
				onChange={ ( value ) => setText( value ?? '' ) }
			/>
		);
	},
};

interface FormData {
	title: string;
	subtitle: string;
	description: string;
}

const createCustomValidator = ( field: NormalizedField< FormData > ) => ( value: any ) => {
	if ( field.id === 'title' && ! value ) {
		return 'Title is required';
	}
	if ( typeof value === 'string' && value.toLowerCase().includes( 'error' ) ) {
		return 'The word "error" is not allowed';
	}
};

// Custom Edit component that uses ValidatedTextControl
const CustomTextEdit = ( { data, field, onChange }: DataFormControlProps< FormData > ) => {
	const value = field.getValue( { item: data } );
	return (
		<ValidatedTextControl
			label={ field.label }
			value={ value }
			required={ field.id === 'title' }
			help="The word 'error' will trigger an error."
			customValidator={ createCustomValidator( field ) }
			onChange={ ( newValue ) => onChange( { [ field.id ]: newValue } ) }
		/>
	);
};

// Custom Edit component that uses ValidatedTextareaControl
const CustomTextareaEdit = ( { data, field, onChange }: DataFormControlProps< FormData > ) => {
	const value = field.getValue( { item: data } );
	return (
		<ValidatedTextareaControl
			label={ field.label }
			value={ value }
			help="The word 'error' will trigger an error."
			customValidator={ createCustomValidator( field ) }
			onChange={ ( newValue ) => onChange( { [ field.id ]: newValue } ) }
		/>
	);
};

/**
 * Example of using DataForm with custom validated form controls
 */
export const WithDataForm: Story = {
	render: function Template() {
		const [ data, setData ] = useState< FormData >( {
			title: '',
			subtitle: '',
			description: '',
		} );

		const fields: Field< FormData >[] = [
			{
				id: 'title',
				label: 'Title',
				type: 'text',
				getValue: ( { item }: { item: FormData } ) => item.title,
				Edit: CustomTextEdit,
			},
			{
				id: 'subtitle',
				label: 'Subtitle',
				type: 'text',
				getValue: ( { item }: { item: FormData } ) => item.subtitle,
				Edit: CustomTextEdit,
			},
			{
				id: 'description',
				label: 'Description',
				type: 'text',
				getValue: ( { item }: { item: FormData } ) => item.description,
				Edit: CustomTextareaEdit,
			},
		];

		const form: Form = {
			type: 'regular',
			fields,
		};

		return (
			<DataForm< FormData >
				data={ data }
				form={ form }
				fields={ fields }
				onChange={ ( newData: Partial< FormData > ) => setData( { ...data, ...newData } ) }
			/>
		);
	},
};
