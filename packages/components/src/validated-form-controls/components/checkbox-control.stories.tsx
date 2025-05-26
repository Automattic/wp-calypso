import { fn } from '@storybook/test';
import { useState } from 'react';
import { ValidatedCheckboxControl } from './checkbox-control';
import { formDecorator } from './story-utils';
import type { StoryObj, Meta } from '@storybook/react';

const meta: Meta< typeof ValidatedCheckboxControl > = {
	title: 'Validated Form Controls/ValidatedCheckboxControl',
	component: ValidatedCheckboxControl,
	decorators: formDecorator,
	args: { onChange: fn() },
	argTypes: {
		checked: { control: false },
		// TODO: Figure out why this deprecated prop is still showing up here and not in the WP Storybook.
		heading: { table: { disable: true } },
	},
};
export default meta;

export const Default: StoryObj< typeof ValidatedCheckboxControl > = {
	render: function Template( { onChange, ...args } ) {
		const [ checked, setChecked ] = useState( false );

		return (
			<ValidatedCheckboxControl
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
	label: 'Checkbox',
	help: 'This checkbox may neither be checked nor unchecked.',
	customValidator: ( value ) => {
		if ( value ) {
			return 'This checkbox may not be checked.';
		}
	},
};
