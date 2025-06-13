import { useArgs } from '@storybook/preview-api';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ExperienceControl } from './index';

const meta: Meta< typeof ExperienceControl > = {
	title: 'packages/components/ExperienceControl',
	component: ExperienceControl,
	args: {
		onChange: fn(),
	},
	render: function Render( args ) {
		const [ { value }, updateArgs ] = useArgs();

		return (
			<ExperienceControl
				{ ...args }
				value={ value }
				onChange={ ( newValue ) => {
					updateArgs( { value: newValue } );
					args.onChange?.( newValue );
				} }
			/>
		);
	},
};

export default meta;
type Story = StoryObj< typeof ExperienceControl >;

export const Default: Story = {
	args: {
		label: 'How was your experience?',
		value: 'good',
	},
};
