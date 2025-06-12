/**
 * WordPress dependencies
 */
import { useMemo, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DataForm from '../index';
import { initialData, getFields, getForm, type FormData } from './fixtures';
import { useValidation } from '../../validator';
import { Button } from '@wordpress/components';

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
}: {
	type: 'regular' | 'panel';
	labelPosition: 'top' | 'side' | 'none';
	minLength: number;
	maxLength: number;
} ) => {
	const [ post, setPost ] = useState< FormData >( initialData );

	const fields = useMemo( () => getFields(), [] );

	const form = useMemo(
		() => getForm( type, labelPosition ),
		[ type, labelPosition ]
	);

	return (
		<DataForm< FormData >
			fields={ fields }
			form={ form }
			data={ post }
			onChange={ ( edits ) =>
				setPost( ( prev ) => ( { ...prev, ...edits } ) )
			}
		/>
	);
};

const DataFormWithValidationFreeComposition = ( {
	type,
	labelPosition,
}: {
	type: 'regular' | 'panel';
	labelPosition: 'top' | 'side' | 'none';
} ) => {
	const [ post, setPost ] = useState< FormData >( initialData );

	const fields = useMemo( () => getFields(), [] );

	const form = useMemo(
		() => getForm( type, labelPosition ),
		[ type, labelPosition ]
	);

	const validation = useValidation();

	return (
		<>
			<DataForm< FormData >
				validation={ validation }
				fields={ fields }
				form={ form }
				data={ post }
				onChange={ ( edits ) =>
					setPost( ( prev ) => ( { ...prev, ...edits } ) )
				}
			/>

			<Button disabled={ ! validation.isFormValid } variant="primary">
				{ validation.isFormValid ? 'Send' : 'Please fix the errors' }
			</Button>

			<p>Touched fields: { validation.touchedFields.join( ', ' ) }</p>
			<p>
				Error messages: { JSON.stringify( validation.errorMessages ) }
			</p>
		</>
	);
};

export const Default = {
	title: 'Default',
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

export const ValidationFreeComposition = {
	title: 'Validation Free Composition',
	render: DataFormWithValidationFreeComposition,
	argTypes: {
		...meta.argTypes,
	},
	args: {
		type: 'regular',
		labelPosition: 'top',
	},
};
