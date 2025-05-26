import { fn } from '@storybook/test';
import { useState } from 'react';
import { formDecorator } from './story-utils';
import { ValidatedTextControl } from './text-control';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof ValidatedTextControl > = {
	title: 'Validated Form Controls/ValidatedTextControl',
	component: ValidatedTextControl,
	decorators: formDecorator,
	args: { onChange: fn() },
	argTypes: {
		value: { control: false },
	},
};
export default meta;

export const Default: StoryObj< typeof ValidatedTextControl > = {
	render: function Template( { onChange, ...args } ) {
		const [ value, setValue ] = useState( '' );

		return (
			<ValidatedTextControl
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
	label: 'Text',
	help: "The word 'error' will trigger an error.",
	customValidator: ( value ) => {
		if ( value?.toString().toLowerCase() === 'error' ) {
			return 'The word "error" is not allowed.';
		}
	},
};
