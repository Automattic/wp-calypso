import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Chat } from '../chat/Chat';
import { MockProviders } from '../../mocks/providers';

const meta = {
	title: 'Chat/Chat/Floating States',
	component: Chat,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Different view states of the Chat component for various UI contexts and user interactions.',
			},
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: [ 'floating', 'embedded' ],
		},
		chatState: {
			control: 'select',
			options: [ 'collapsed', 'compact', 'expanded' ],
		},
		placeholder: {
			control: 'text',
		},
	},
	decorators: [
		( Story ) => (
			<MockProviders>
				<Story />
			</MockProviders>
		),
	],
} satisfies Meta< typeof Chat >;

export default meta;
type Story = StoryObj< typeof meta >;

export const CollapsedView: Story = {
	name: 'Collapsed',
	args: {
		variant: 'floating',
		chatState: 'collapsed',
		placeholder: 'Ask me anything...',
	},
	parameters: {
		docs: {
			description: {
				story: 'The collapsed state shows as a floating button, typically used as the initial state for floating chat interfaces.',
			},
		},
	},
};

export const CompactView: Story = {
	name: 'Compact',
	args: {
		variant: 'floating',
		chatState: 'compact',
		placeholder: 'Ask me anything...',
	},
	parameters: {
		docs: {
			description: {
				story: 'The compact state shows only the input field, useful for space-constrained interfaces or as an intermediate state.',
			},
		},
	},
};

export const ConversationView: Story = {
	name: 'Expanded',
	args: {
		variant: 'floating',
		chatState: 'expanded',
		placeholder: 'Ask me anything...',
	},
	parameters: {
		docs: {
			description: {
				story: 'The expanded state shows the full conversation interface with message history, input field, and suggestions.',
			},
		},
	},
};
