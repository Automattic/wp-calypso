import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ExperienceControl, ExperienceType } from './index';

const meta: Meta< typeof ExperienceControl > = {
	title: 'Unaudited/ExperienceControl',
	component: ExperienceControl,
};

export default meta;
type Story = StoryObj< typeof ExperienceControl >;

export const Default: Story = {
	args: {
		label: 'How was your experience?',
		value: ExperienceType.GOOD,
		onChange: fn(),
	},
};

export const WithHelpText: Story = {
	args: {
		label: 'Rate your satisfaction',
		value: ExperienceType.GOOD,
		help: 'Please select an option that best describes your experience',
		onChange: fn(),
	},
};

export const PreSelectedBad: Story = {
	args: {
		label: 'How was the support?',
		value: ExperienceType.BAD,
		onChange: fn(),
	},
};

// Example of using the Base component directly
export const CustomBase: Story = {
	render: () => (
		<ExperienceControl.Base label="Custom Experience Control">
			<ExperienceControl.Option
				checked
				onClick={ fn() }
				value="1"
				name="experience-control"
				ariaLabel="Rate as good experience"
			>
				1
			</ExperienceControl.Option>
		</ExperienceControl.Base>
	),
};
