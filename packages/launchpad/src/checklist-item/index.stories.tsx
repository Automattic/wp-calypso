import ChecklistItem from './';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof ChecklistItem > = {
	title: 'Launchpad/ChecklistItem',
	component: ChecklistItem,
	decorators: [
		( Story ) => (
			<div style={ { width: 300 } }>
				<ul className="checklist__tasks">
					<Story />
				</ul>
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
		onClick: () => {},
		task: baseTask,
	},
};

export const Completed: Story = {
	args: {
		onClick: () => {},
		task: { ...baseTask, completed: true },
	},
};

export const Disabled: Story = {
	args: {
		onClick: () => {},
		task: { ...baseTask, disabled: true },
	},
};

export const WithBadgetText: Story = {
	args: {
		onClick: () => {},
		task: { ...baseTask, badge_text: 'Upgrade plan' },
	},
};

export const WithTaskCounter: Story = {
	args: {
		onClick: () => {},
		task: { ...baseTask, repetition_count: 1, target_repetitions: 3 },
	},
};

export const WithSubtitle: Story = {
	args: {
		onClick: () => {},
		task: { ...baseTask, subtitle: 'This is a subtitle' },
	},
};

export const Expanded: Story = {
	args: {
		task: baseTask,
		expandable: {
			content: <p>This is the expanded content.</p>,
			isOpen: true,
		},
	},
};

export const ExpandedWithAction: Story = {
	args: {
		task: baseTask,
		expandable: {
			content: <p>This is the expanded content.</p>,
			isOpen: true,
		},
	},
};

export default meta;
