import { fn } from '@storybook/test';
import {
	/* eslint-disable wpcalypso/no-unsafe-wp-apis */
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	/* eslint-enable wpcalypso/no-unsafe-wp-apis */
} from '@wordpress/components';
import { useState } from 'react';
import { formDecorator } from './story-utils';
import { ValidatedToggleGroupControl } from './toggle-group-control';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof ValidatedToggleGroupControl > = {
	title: 'Validated Form Controls/ValidatedToggleGroupControl',
	component: ValidatedToggleGroupControl,
	decorators: formDecorator,
	args: { onChange: fn() },
	argTypes: {
		value: { control: false },
	},
};
export default meta;

export const Default: StoryObj< typeof ValidatedToggleGroupControl > = {
	render: function Template( { onChange, ...args } ) {
		const [ value, setValue ] =
			useState< React.ComponentProps< typeof ValidatedToggleGroupControl >[ 'value' ] >( '1' );

		return (
			<ValidatedToggleGroupControl
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
	label: 'Toggle Group',
	isBlock: true,
	children: [
		<ToggleGroupControlOption value="1" key="1" label="Option 1" />,
		<ToggleGroupControlOption value="2" key="2" label="Option 2" />,
	],
	help: 'Selecting option 2 will trigger an error.',
	customValidator: ( value ) => {
		if ( value === '2' ) {
			return 'Option 2 is not allowed.';
		}
	},
};
