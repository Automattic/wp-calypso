/**
 * WordPress dependencies
 */
import { useMemo, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DataForm from '../index';
import { initialData, getFields, getForm, type FormData } from './fixtures';
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
