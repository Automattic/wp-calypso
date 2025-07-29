import type { Meta, StoryObj } from '@storybook/react';
import { Message } from './Message';
import type { Message as MessageType } from '../../types';

const meta = {
	title: 'Chat/Message',
	component: Message,
	parameters: {
		layout: 'padded',
	},
	tags: [ 'autodocs' ],
	argTypes: {
		message: {
			control: 'object',
			description: 'The message object to display',
		},
	},
} satisfies Meta< typeof Message >;

export default meta;
type Story = StoryObj< typeof meta >;

// Mock messages
const userMessage: MessageType = {
	id: '1',
	content: [
		{
			type: 'text',
			text: 'Can you show me my sales data for last month?',
		},
	],
	role: 'user',
	timestamp: Date.now(),
	archived: false,
	showIcon: true,
};

const agentMessage: MessageType = {
	id: '2',
	content: [
		{
			type: 'text',
			text: "I'd be happy to help you view your sales data for last month. Let me analyze your store's performance.",
		},
	],
	role: 'agent',
	timestamp: Date.now(),
	archived: false,
	showIcon: true,
};

const markdownMessage: MessageType = {
	id: '3',
	content: [
		{
			type: 'text',
			text: `Here's a summary of your sales data:

## Sales Summary
- **Total Revenue**: $12,450
- **Orders**: 234
- **Average Order Value**: $53.21

### Top Products
1. Premium Widget - 45 units
2. Standard Gadget - 38 units
3. Basic Tool - 29 units

*Data current as of yesterday*`,
		},
	],
	role: 'agent',
	timestamp: Date.now(),
	archived: false,
	showIcon: true,
};

const codeMessage: MessageType = {
	id: '4',
	content: [
		{
			type: 'text',
			text: `Here's a code snippet to help you:

\`\`\`javascript
const calculateRevenue = (orders) => {
  return orders.reduce((sum, order) => sum + order.total, 0);
};
\`\`\`

This function will sum up all your order totals.`,
		},
	],
	role: 'agent',
	timestamp: Date.now(),
	archived: false,
	showIcon: true,
};

export const UserMessage: Story = {
	args: {
		message: userMessage,
	},
};

export const AssistantMessage: Story = {
	args: {
		message: agentMessage,
	},
};

export const MarkdownContent: Story = {
	args: {
		message: markdownMessage,
	},
};

export const CodeContent: Story = {
	args: {
		message: codeMessage,
	},
};

export const LongMessage: Story = {
	args: {
		message: {
			id: '5',
			content: [
				{
					type: 'text',
					text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
				},
			],
			role: 'agent',
			timestamp: Date.now(),
			archived: false,
			showIcon: true,
		},
	},
};

export const MessageThread: Story = {
	render: () => (
		<div
			style={ { display: 'flex', flexDirection: 'column', gap: '1rem' } }
		>
			<Message message={ userMessage } />
			<Message message={ agentMessage } />
			<Message message={ markdownMessage } />
			<Message
				message={ {
					...userMessage,
					id: '6',
					content: [
						{
							type: 'text',
							text: 'Thanks for the summary!',
						},
					],
				} }
			/>
		</div>
	),
	args: {
		message: userMessage,
	},
};
