/**
 * WordPress dependencies
 */
import { useMemo, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DataForm from '../index';
import { initialData, getFields, getForm, type FormData } from './fixtures';
import { isItemValid } from '../../../validation';
import { getAllValidationErrors } from '../../validation';

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
	},
};
export default meta;

const DataFormWithValidation = ( {
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

	const isFormValid = useMemo(
		() => isItemValid( post, fields, form ),
		[ post, fields, form ]
	);

	return (
		<>
			<DataForm< FormData >
				fields={ fields }
				form={ form }
				data={ post }
				onChange={ ( edits ) =>
					setPost( ( prev ) => ( { ...prev, ...edits } ) )
				}
			/>
			<p>Form is valid: { isFormValid ? 'true' : 'false' }</p>
			<p>
				Validation errors:{ ' ' }
				{ JSON.stringify(
					getAllValidationErrors( post, fields, form )
				) }
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
	},
};
