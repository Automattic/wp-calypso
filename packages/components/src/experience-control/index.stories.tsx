import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ExperienceControl } from './index';

const meta: Meta< typeof ExperienceControl > = {
	title: 'packages/components/ExperienceControl',
	component: ExperienceControl,
	args: { onChange: fn() },
};

export default meta;
type Story = StoryObj< typeof ExperienceControl >;

export const Default: Story = {
	args: {
		label: 'How was your experience?',
		value: 'good',
	},
};

export const WithHelpText: Story = {
	args: {
		label: 'Rate your satisfaction',
		value: 'good',
		help: 'Please select an option that best describes your experience',
	},
};

export const PreSelectedBad: Story = {
	args: {
		label: 'How was the support?',
		value: 'bad',
	},
};
