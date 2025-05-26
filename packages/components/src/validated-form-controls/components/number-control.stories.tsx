import { fn } from '@storybook/test';
import { useState } from 'react';
import { ValidatedNumberControl } from './number-control';
import { formDecorator } from './story-utils';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof ValidatedNumberControl > = {
	title: 'Validated Form Controls/ValidatedNumberControl',
	component: ValidatedNumberControl,
	decorators: formDecorator,
	args: { onChange: fn() },
	argTypes: {
		prefix: { control: { type: 'text' } },
		step: { control: { type: 'text' } },
		suffix: { control: { type: 'text' } },
		type: { control: { type: 'text' } },
		value: { control: false },
	},
};
export default meta;

export const Default: StoryObj< typeof ValidatedNumberControl > = {
	render: function Template( { onChange, ...args } ) {
		const [ value, setValue ] =
			useState< React.ComponentProps< typeof ValidatedNumberControl >[ 'value' ] >();

		return (
			<ValidatedNumberControl
				{ ...args }
				value={ value }
				onChange={ ( newValue, ...rest ) => {
					setValue( newValue );
					onChange?.( newValue, ...rest );
				} }
			/>
		);
	},
};
Default.args = {
	required: true,
	label: 'Number',
	help: 'Odd numbers are not allowed.',
	customValidator: ( value ) => {
		if ( value && parseInt( value.toString(), 10 ) % 2 !== 0 ) {
			return 'Choose an even number.';
		}
	},
};
