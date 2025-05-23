import { fn } from '@storybook/test';
import { useState } from 'react';
import { ValidatedRadioControl } from './radio-control';
import { formDecorator } from './story-utils';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof ValidatedRadioControl > = {
	title: 'Validated Form Controls/ValidatedRadioControl',
	component: ValidatedRadioControl,
	decorators: formDecorator,
	args: { onChange: fn() },
	argTypes: {
		selected: { control: false },
	},
};
export default meta;

export const Default: StoryObj< typeof ValidatedRadioControl > = {
	render: function Template( { onChange, ...args } ) {
		const [ selected, setSelected ] =
			useState< React.ComponentProps< typeof ValidatedRadioControl >[ 'selected' ] >();

		return (
			<ValidatedRadioControl
				{ ...args }
				selected={ selected }
				onChange={ ( value ) => {
					setSelected( value );
					onChange?.( value );
				} }
			/>
		);
	},
};
Default.args = {
	required: true,
	label: 'Radio',
	help: 'Option B is not allowed.',
	options: [
		{ label: 'Option A', value: 'a' },
		{ label: 'Option B (not allowed)', value: 'b' },
	],
	customValidator: ( value ) => {
		if ( value === 'b' ) {
			return 'Option B is not allowed.';
		}
	},
};
