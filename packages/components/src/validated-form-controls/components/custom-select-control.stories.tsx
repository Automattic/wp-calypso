import { fn } from '@storybook/test';
import { useState } from 'react';
import { ValidatedCustomSelectControl } from './custom-select-control';
import { formDecorator } from './story-utils';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof ValidatedCustomSelectControl > = {
	title: 'Validated Form Controls/ValidatedCustomSelectControl',
	component: ValidatedCustomSelectControl,
	decorators: formDecorator,
	args: { onChange: fn() },
	argTypes: {
		value: { control: false },
	},
};
export default meta;

export const Default: StoryObj< typeof ValidatedCustomSelectControl > = {
	render: function Template( { onChange, ...args } ) {
		const [ value, setValue ] =
			useState< React.ComponentProps< typeof ValidatedCustomSelectControl >[ 'value' ] >();

		return (
			<ValidatedCustomSelectControl
				{ ...args }
				value={ value }
				onChange={ ( newValue ) => {
					setValue( newValue.selectedItem );
					onChange?.( newValue );
				} }
			/>
		);
	},
};
Default.args = {
	required: true,
	label: 'Custom Select',
	options: [
		{ key: '', name: 'Select an option' },
		{ key: 'a', name: 'Option A (not allowed)' },
		{ key: 'b', name: 'Option B' },
	],
	customValidator: ( value ) => {
		if ( value?.key === 'a' ) {
			return 'Option A is not allowed.';
		}
	},
};
