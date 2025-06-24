import { fn } from '@storybook/test';
import { useState } from 'react';
import { formDecorator } from './story-utils';
import { ValidatedToggleControl } from './toggle-control';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof ValidatedToggleControl > = {
	title: 'Validated Form Controls/ValidatedToggleControl',
	component: ValidatedToggleControl,
	decorators: formDecorator,
	args: { onChange: fn() },
	argTypes: {
		checked: { control: false },
	},
};
export default meta;

export const Default: StoryObj< typeof ValidatedToggleControl > = {
	render: function Template( { onChange, ...args } ) {
		const [ checked, setChecked ] = useState( false );

		return (
			<ValidatedToggleControl
				{ ...args }
				checked={ checked }
				onChange={ ( value ) => {
					setChecked( value );
					onChange?.( value );
				} }
			/>
		);
	},
};
Default.args = {
	required: true,
	label: 'Toggle',
	help: 'This toggle may neither be enabled nor disabled.',
	customValidator: ( value ) => {
		if ( value ) {
			return 'This toggle may not be enabled.';
		}
	},
};
