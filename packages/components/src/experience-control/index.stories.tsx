import { Meta, StoryObj } from '@storybook/react';
import { ExperienceControl } from './index';

const meta: Meta< typeof ExperienceControl > = {
	title: 'Unaudited/ExperienceControl',
	component: ExperienceControl,
};

export default meta;
type Story = StoryObj< typeof ExperienceControl >;

export const Default: Story = {
	args: {
		label: 'How was your experience?',
		selectedExperience: 'good',
		onChange: () => {},
	},
};

export const WithHelpText: Story = {
	args: {
		label: 'Rate your satisfaction',
		selectedExperience: 'good',
		helpText: 'Please select an option that best describes your experience',
		onChange: () => {},
	},
};

export const PreSelectedBad: Story = {
	args: {
		label: 'How was the support?',
		selectedExperience: 'bad',
		onChange: () => {},
	},
};

// Example of using the Base component directly
export const CustomBase: Story = {
	render: () => (
		<ExperienceControl.Base label="Custom Experience Control">
			<ExperienceControl.Option isSelected onClick={ () => {} }>
				1
			</ExperienceControl.Option>
		</ExperienceControl.Base>
	),
};
