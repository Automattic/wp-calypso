import { fn } from '@storybook/test';
import { useState } from 'react';
import { ValidatedSelectControl } from './select-control';
import { formDecorator } from './story-utils';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof ValidatedSelectControl > = {
	title: 'Validated Form Controls/ValidatedSelectControl',
	component: ValidatedSelectControl,
	decorators: formDecorator,
	args: { onChange: fn() },
	argTypes: {
		value: { control: false },
	},
};
export default meta;

export const Default: StoryObj< typeof ValidatedSelectControl > = {
	render: function Template( { onChange, ...args } ) {
		const [ value, setValue ] = useState( '' );

		return (
			<ValidatedSelectControl
				{ ...args }
				value={ value }
				onChange={ ( newValue ) => {
					setValue( newValue );
					onChange?.( newValue );
				} }
			/>
		);
	},
};
Default.args = {
	required: true,
	label: 'Select',
	help: 'Selecting option 1 will trigger an error.',
	options: [
		{ value: '', label: 'Select an option' },
		{ value: '1', label: 'Option 1 (not allowed)' },
		{ value: '2', label: 'Option 2' },
	],
	customValidator: ( value ) => {
		if ( value === '1' ) {
			return 'Option 1 is not allowed.';
		}
	},
};
