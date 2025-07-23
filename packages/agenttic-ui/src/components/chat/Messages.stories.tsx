import type { Meta, StoryObj } from '@storybook/react';
import { Messages } from './Messages';
import type { Message } from '../../types';

const meta = {
	title: 'Chat/Messages',
	component: Messages,
	parameters: {
		layout: 'fullscreen',
	},
	tags: [ 'autodocs' ],
	argTypes: {
		messages: {
			control: 'object',
			description: 'Array of messages to display',
		},
		isThinking: {
			control: 'boolean',
			description: 'Whether the assistant is currently thinking',
		},
		error: {
			control: 'text',
			description: 'Error message to display',
		},
		emptyView: {
			control: 'object',
			description: 'Custom empty state component',
		},
		fromCompact: {
			control: 'boolean',
			description: 'Whether transitioning from compact mode',
		},
	},
} satisfies Meta< typeof Messages >;

export default meta;
type Story = StoryObj< typeof meta >;

const mockConversation: Message[] = [
	{
		id: '1',
		content: [
			{
				type: 'text',
				text: 'Hello! I need help with my store analytics.',
			},
		],
		role: 'user',
		created_at: Date.now() - 240000,
		archived: false,
		showIcon: true,
	},
	{
		id: '2',
		content: [
			{
				type: 'text',
				text: "I'd be happy to help you with your store analytics! What specific information would you like to see?",
			},
		],
		role: 'assistant',
		created_at: Date.now() - 180000,
		archived: false,
		showIcon: true,
	},
	{
		id: '3',
		content: [
			{
				type: 'text',
				text: 'Can you show me my top selling products from last month?',
			},
		],
		role: 'user',
		created_at: Date.now() - 120000,
		archived: false,
		showIcon: true,
	},
	{
		id: '4',
		content: [
			{
				type: 'text',
				text: `Here are your top selling products from last month:

## Top 5 Products - November 2023

1. **Premium Widget Pro** - 156 units sold ($4,680 revenue)
2. **Standard Widget** - 134 units sold ($2,680 revenue)
3. **Basic Widget** - 98 units sold ($980 revenue)
4. **Widget Accessories Pack** - 87 units sold ($435 revenue)
5. **Widget Maintenance Kit** - 72 units sold ($360 revenue)

Total units sold: 547
Total revenue from top 5: $9,135`,
			},
		],
		role: 'assistant',
		created_at: Date.now() - 60000,
		archived: false,
		showIcon: true,
	},
	{
		id: '5',
		content: [
			{
				type: 'text',
				text: "That's great! Can you also show me the growth compared to the previous month?",
			},
		],
		role: 'user',
		created_at: Date.now(),
		archived: false,
		showIcon: true,
	},
];

export const Default: Story = {
	args: {
		messages: mockConversation,
		isThinking: false,
	},
};

export const Empty: Story = {
	args: {
		messages: [],
		isThinking: false,
		emptyView: <div>No messages yet. Start a conversation!</div>,
	},
};

export const Thinking: Story = {
	args: {
		messages: mockConversation,
		isThinking: true,
	},
};

export const SingleMessage: Story = {
	args: {
		messages: [ mockConversation[ 0 ] ],
		isThinking: false,
	},
};

export const LongConversation: Story = {
	args: {
		messages: [
			...mockConversation,
			{
				id: '6',
				content: [
					{
						type: 'text',
						text: `Let me analyze the growth compared to October 2023:

## Growth Analysis: November vs October

### Overall Performance
- **Total Revenue**: $45,230 (November) vs $41,150 (October)
- **Growth Rate**: +9.9% 📈

### Product-by-Product Growth
1. **Premium Widget Pro**: +15% (136 → 156 units)
2. **Standard Widget**: +8% (124 → 134 units)
3. **Basic Widget**: -5% (103 → 98 units)
4. **Widget Accessories Pack**: +22% (71 → 87 units)
5. **Widget Maintenance Kit**: +12% (64 → 72 units)

### Key Insights
- Strong growth in premium and accessory products
- Basic Widget saw a slight decline - consider promotional strategies
- Overall healthy growth trajectory`,
					},
				],
				role: 'assistant',
				created_at: Date.now() + 60000,
				archived: false,
				showIcon: true,
			},
			{
				id: '7',
				content: [
					{
						type: 'text',
						text: 'This is very helpful! What would you recommend to improve Basic Widget sales?',
					},
				],
				role: 'user',
				created_at: Date.now() + 120000,
				archived: false,
				showIcon: true,
			},
			{
				id: '8',
				content: [
					{
						type: 'text',
						text: 'Based on the data, here are my recommendations for improving Basic Widget sales:\n\n1. **Bundle Offers**: Create a starter bundle with Basic Widget + Accessories\n2. **Limited-Time Discount**: Offer 15-20% off for first-time buyers\n3. **Upsell Campaign**: Target Basic Widget customers with upgrade offers\n4. **Content Marketing**: Create tutorials showing Basic Widget use cases',
					},
				],
				role: 'assistant',
				created_at: Date.now() + 180000,
				archived: false,
				showIcon: true,
			},
		],
		isThinking: false,
	},
};

export const WithError: Story = {
	args: {
		messages: mockConversation.slice( 0, 3 ),
		isThinking: false,
		error: 'Sorry, I encountered an error while processing your request. Please try again.',
	},
};
