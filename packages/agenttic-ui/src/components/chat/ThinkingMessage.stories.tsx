import type { Meta, StoryObj } from '@storybook/react';
import { ThinkingMessage } from './ThinkingMessage';
import { Message } from './Message';
import type { Message as MessageType } from '../../types';

const meta = {
	title: 'Chat/ThinkingMessage',
	component: ThinkingMessage,
	parameters: {
		layout: 'padded',
	},
	tags: [ 'autodocs' ],
} satisfies Meta< typeof ThinkingMessage >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {},
};

const userMessage: MessageType = {
	id: '1',
	content: [
		{
			type: 'text',
			text: 'Analyze my store performance for the last quarter',
		},
	],
	role: 'user',
	created_at: Date.now(),
	archived: false,
	showIcon: true,
};

const agentMessage: MessageType = {
	id: '2',
	content: [
		{
			type: 'text',
			text: 'I will analyze your store performance for the last quarter. Let me gather that data for you...',
		},
	],
	role: 'agent',
	created_at: Date.now(),
	archived: false,
	showIcon: true,
};

export const InConversation: Story = {
	render: () => (
		<div
			style={ { display: 'flex', flexDirection: 'column', gap: '1rem' } }
		>
			<Message message={ userMessage } />
			<Message message={ agentMessage } />
			<ThinkingMessage />
		</div>
	),
	args: {},
};
