import ChecklistItem from './';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof ChecklistItem > = {
	title: 'Launchpad/ChecklistItem',
	component: ChecklistItem,
	decorators: [
		( Story ) => (
			<div style={ { width: 300 } }>
				<Story />
			</div>
		),
	],
};

type Story = StoryObj< typeof meta >;
const baseTask = {
	id: '1',
	title: 'Task 1',
	completed: false,
	disabled: false,
};

export const Default: Story = {
	args: {
		task: baseTask,
	},
};

export const Completed: Story = {
	args: {
		task: { ...baseTask, completed: true },
	},
};

export const Disabled: Story = {
	args: {
		task: { ...baseTask, disabled: true },
	},
};
export const WithBadgetText: Story = {
	args: {
		task: { ...baseTask, badge_text: 'Upgrade plan' },
	},
};

export const WithTaskCounter: Story = {
	args: {
		task: { ...baseTask, repetition_count: 1, target_repetitions: 3 },
	},
};

export const WithSubtitle: Story = {
	args: {
		task: { ...baseTask, subtitle: 'This is a subtitle' },
	},
};

export default meta;
