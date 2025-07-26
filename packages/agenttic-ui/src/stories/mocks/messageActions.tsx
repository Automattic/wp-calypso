import React from 'react';
import type { Message, MessageAction } from '../../types';
import { CopyIcon, ThumbsDownIcon, ThumbsUpIcon } from '../../components';

// Mock message data
export const mockAgentMessage: Message = {
	id: 'agent-1',
	role: 'agent',
	content: [
		{
			type: 'text',
			text: "I've analyzed your sales data for last month. Here are the key insights:\n\n• Total revenue: $45,230 (↑ 12% from previous month)\n• Orders: 892 (↑ 8%)\n• Average order value: $50.71",
		},
	],
	created_at: Date.now() - 60000,
	archived: false,
	showIcon: true,
};

export const mockUserMessage: Message = {
	id: 'user-1',
	role: 'user',
	content: [
		{
			type: 'text',
			text: 'Can you show me my sales performance for last month?',
		},
	],
	created_at: Date.now() - 120000,
	archived: false,
	showIcon: false,
};

export const mockLongAgentMessage: Message = {
	id: 'agent-2',
	role: 'agent',
	content: [
		{
			type: 'text',
			text: `## Comprehensive Sales Analysis

Your store has shown remarkable growth across multiple metrics. Let me break down the key performance indicators:

### Revenue Trends
The total revenue for last month was **$45,230**, representing a 12% increase compared to the previous month. This growth was primarily driven by:

1. **New Product Launches** - The introduction of premium widgets contributed $8,450 in additional revenue
2. **Seasonal Promotions** - Our summer sale campaign generated a 25% spike in daily orders
3. **Improved Conversion Rate** - Website optimizations led to a 3.2% improvement in checkout completion

### Customer Behavior
- **New vs Returning**: 68% returning customers, 32% new acquisitions
- **Average Session Duration**: 4 minutes 32 seconds (↑ 18%)
- **Cart Abandonment Rate**: 42% (↓ 8% improvement)

### Top Performing Products
1. Premium Widget Pro - 234 units sold
2. Standard Gadget Plus - 189 units sold
3. Basic Tool Set - 156 units sold

Would you like me to generate a detailed report or focus on any specific aspect?`,
		},
	],
	created_at: Date.now() - 30000,
	archived: false,
	showIcon: true,
};

// Mock action handlers
export const mockHandlers = {
	onCopy: async ( message: Message ) => {
		const textContent = message.content
			.filter( ( c ) => c.type === 'text' )
			.map( ( c ) => c.text )
			.join( '\n' );
		console.log( 'Copy action clicked for message:', message.id );
		console.log( 'Content to copy:', textContent );
		// In real implementation, this would use navigator.clipboard.writeText
	},

	onFeedback: async ( messageId: string, feedback: 'up' | 'down' ) => {
		console.log( `Feedback for message ${ messageId }: ${ feedback }` );
		// In real implementation, this would send feedback to the server
	},

	onShare: async ( message: Message ) => {
		console.log( 'Share action clicked for message:', message.id );
		// In real implementation, this would open a share dialog
	},

	onEdit: async ( message: Message ) => {
		console.log( 'Edit action clicked for message:', message.id );
		// In real implementation, this would enable edit mode
	},

	onRetry: async ( message: Message ) => {
		console.log( 'Retry action clicked for message:', message.id );
		// In real implementation, this would regenerate the response
	},
};

// Static action definitions
export const copyAction: MessageAction = {
	id: 'copy',
	label: 'Copy message',
	icon: <CopyIcon size={ 16 } />,
	onClick: mockHandlers.onCopy,
	tooltip: 'Copy to clipboard',
};

export const shareAction: MessageAction = {
	id: 'share',
	label: 'Share',
	icon: (
		<div
			style={ {
				width: '16px',
				height: '16px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			} }
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				style={ { width: '16px', height: '16px' } }
			>
				<path d="M2.667 8v5.333A1.333 1.333 0 0 0 4 14.667h8a1.333 1.333 0 0 0 1.333-1.334V8" />
				<polyline points="10.667 4 8 1.333 5.333 4" />
				<line x1="8" y1="1.333" x2="8" y2="10" />
			</svg>
		</div>
	),
	onClick: mockHandlers.onShare,
	tooltip: 'Share this message',
};

export const editAction: MessageAction = {
	id: 'edit',
	label: 'Edit',
	icon: (
		<div
			style={ {
				width: '16px',
				height: '16px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			} }
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				style={ { width: '16px', height: '16px' } }
			>
				<path d="M7.333 2.667H2.667A1.333 1.333 0 0 0 1.333 4v9.333a1.333 1.333 0 0 0 1.334 1.334H12a1.333 1.333 0 0 0 1.333-1.334V8.667" />
				<path d="M12.333 1.667a1.414 1.414 0 0 1 2 2L8 10l-2.667.667L6 8l6.333-6.333z" />
			</svg>
		</div>
	),
	onClick: mockHandlers.onEdit,
	tooltip: 'Edit this message',
};

export const retryAction: MessageAction = {
	id: 'retry',
	label: 'Retry',
	icon: (
		<div
			style={ {
				width: '16px',
				height: '16px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			} }
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				style={ { width: '16px', height: '16px' } }
			>
				<polyline points="0.667 2.667 0.667 6.667 4.667 6.667" />
				<path d="M2.34 10a6 6 0 1 0 1.42-6.24L0.667 6.667" />
			</svg>
		</div>
	),
	onClick: mockHandlers.onRetry,
	tooltip: 'Regenerate response',
};

// Helper to create messages with actions
export function createMessageWithActions(
	base: Message,
	actions: MessageAction[]
): Message {
	return {
		...base,
		actions,
	};
}

// Helper to create a message with feedback actions
export function createMessageWithFeedback(
	base: Message,
	feedbackState?: 'up' | 'down'
): Message {
	const actions: MessageAction[] = [];

	if ( feedbackState !== 'down' ) {
		actions.push( {
			id: 'feedback-up',
			label: 'Good response',
			icon: <ThumbsUpIcon size={ 16 } />,
			onClick: () => mockHandlers.onFeedback( base.id, 'up' ),
			tooltip: 'This response was helpful',
			disabled: feedbackState === 'up',
		} );
	}

	if ( feedbackState !== 'up' ) {
		actions.push( {
			id: 'feedback-down',
			label: 'Bad response',
			icon: <ThumbsDownIcon size={ 16 } />,
			onClick: () => mockHandlers.onFeedback( base.id, 'down' ),
			tooltip: 'This response was not helpful',
			disabled: feedbackState === 'down',
		} );
	}

	return createMessageWithActions( base, actions );
}

// Helper to create custom icon for messages
export function createCustomIcon( letter: string, color: string = '#007cba' ) {
	return (
		<div
			style={ {
				width: 24,
				height: 24,
				borderRadius: '50%',
				backgroundColor: color,
				color: 'white',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: '14px',
				fontWeight: 'bold',
			} }
		>
			{ letter }
		</div>
	);
}

// Create a thread of messages for testing
export const mockMessageThread: Message[] = [
	mockUserMessage,
	createMessageWithActions( mockAgentMessage, [ copyAction ] ),
	{
		...mockUserMessage,
		id: 'user-2',
		content: [
			{
				type: 'text',
				text: 'Can you provide more details about the top products?',
			},
		],
		created_at: Date.now() - 20000,
	},
	createMessageWithActions( mockLongAgentMessage, [
		copyAction,
		shareAction,
	] ),
];
