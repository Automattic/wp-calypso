import ChecklistItem from '../checklist-item';
import Checklist from './';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof Checklist > = {
	title: 'Launchpad/Checklist',
	component: Checklist,
	decorators: [
		( Story ) => (
			<div style={ { width: 300 } }>
				<Story />
			</div>
		),
	],
	args: {
		children: [
			<ChecklistItem
				key="1"
				task={ { id: '1', title: 'Task 1', completed: true, disabled: true } }
				onClick={ () => {} }
			/>,
			<ChecklistItem
				key="2"
				task={ { id: '2', title: 'Task 2', disabled: false, completed: false } }
				onClick={ () => {} }
			/>,
			<ChecklistItem
				key="3"
				task={ { id: '3', title: 'Task 3', disabled: false, completed: false } }
				onClick={ () => {} }
			/>,
		],
	},
};

type Story = StoryObj< typeof meta >;
export const Default: Story = {};

export const WithMakeLastTaskPrimaryAction: Story = {
	args: {
		makeLastTaskPrimaryAction: true,
	},
};

export default meta;
