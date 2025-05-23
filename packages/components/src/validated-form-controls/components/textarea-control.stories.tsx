import { fn } from '@storybook/test';
import { useState } from 'react';
import { formDecorator } from './story-utils';
import { ValidatedTextareaControl } from './textarea-control';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof ValidatedTextareaControl > = {
	title: 'Validated Form Controls/ValidatedTextareaControl',
	component: ValidatedTextareaControl,
	decorators: formDecorator,
	args: { onChange: fn() },
	argTypes: { value: { control: false } },
};
export default meta;

export const Default: StoryObj< typeof ValidatedTextareaControl > = {
	render: function Template( { onChange, ...args } ) {
		const [ value, setValue ] = useState( '' );

		return (
			<ValidatedTextareaControl
				{ ...args }
				onChange={ ( newValue ) => {
					setValue( newValue );
					onChange?.( newValue );
				} }
				value={ value }
			/>
		);
	},
};
Default.args = {
	required: true,
	label: 'Textarea',
	help: 'The word "error" will trigger an error.',
	customValidator: ( value ) => {
		if ( value?.toLowerCase() === 'error' ) {
			return 'The word "error" is not allowed.';
		}
	},
};
