import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Chat } from '../chat/Chat';
// MockProviders removed - use direct props for stories
import type { Message } from '../../types';

// Mock data for stories
const mockMessages: Message[] = [
	{
		id: '1',
		role: 'user',
		content: [ { type: 'text', text: 'Can you help me with my website?' } ],
		created_at: Date.now() - 60000,
		archived: false,
		showIcon: false,
	},
	{
		id: '2',
		role: 'agent',
		content: [
			{
				type: 'text',
				text: "Of course! I'd be happy to help you with your website. What specific aspect would you like assistance with?",
			},
		],
		created_at: Date.now() - 30000,
		archived: false,
		showIcon: true,
	},
];

const mockOnSubmit = ( message: string ) => {
	console.log( 'Message submitted:', message );
};

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
		floatingChatState: {
			control: 'select',
			options: [ 'collapsed', 'compact', 'expanded' ],
		},
		placeholder: {
			control: 'text',
		},
	},
	// Decorators removed - stories use direct props
} satisfies Meta< typeof Chat >;

export default meta;
type Story = StoryObj< typeof meta >;

export const CollapsedView: Story = {
	name: 'Collapsed',
	args: {
		messages: mockMessages,
		isProcessing: false,
		error: null,
		onSubmit: mockOnSubmit,
		variant: 'floating',
		floatingChatState: 'collapsed',
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
		messages: mockMessages,
		isProcessing: false,
		error: null,
		onSubmit: mockOnSubmit,
		variant: 'floating',
		floatingChatState: 'compact',
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
		messages: mockMessages,
		isProcessing: false,
		error: null,
		onSubmit: mockOnSubmit,
		variant: 'floating',
		floatingChatState: 'expanded',
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
