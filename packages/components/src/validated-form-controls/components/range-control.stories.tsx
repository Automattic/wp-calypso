import { fn } from '@storybook/test';
import { useState } from 'react';
import { ValidatedRangeControl } from './range-control';
import { formDecorator } from './story-utils';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof ValidatedRangeControl > = {
	title: 'Validated Form Controls/ValidatedRangeControl',
	component: ValidatedRangeControl,
	decorators: formDecorator,
	args: { onChange: fn() },
	argTypes: {
		value: { control: false },
	},
};
export default meta;

export const Default: StoryObj< typeof ValidatedRangeControl > = {
	render: function Template( { onChange, ...args } ) {
		const [ value, setValue ] =
			useState< React.ComponentProps< typeof ValidatedRangeControl >[ 'value' ] >();

		return (
			<ValidatedRangeControl
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
	label: 'Range',
	help: 'Odd numbers are not allowed.',
	min: 0,
	max: 20,
	customValidator: ( value ) => {
		if ( value && value % 2 !== 0 ) {
			return 'Choose an even number.';
		}
	},
};
