import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Chat } from './Chat';
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

// MockProviders removed - use direct props for stories

const meta = {
	title: 'Chat/Chat',
	component: Chat,
	parameters: {
		layout: 'padded',
		docs: {
			canvas: {
				sourceState: 'hidden',
			},
		},
	},
	tags: [ 'autodocs' ],
	args: {
		placeholder: 'Ask anything...',
	},
	argTypes: {
		variant: {
			control: 'select',
			options: [ 'floating', 'embedded' ],
		},
		placeholder: {
			control: 'text',
		},
		chatState: {
			control: 'select',
			options: [ 'collapsed', 'compact', 'expanded' ],
		},
	},
	// Decorators removed - stories use direct props
} satisfies Meta< typeof Chat >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		messages: mockMessages,
		isProcessing: false,
		error: null,
		onSubmit: mockOnSubmit,
	},
	render: ( args ) => (
		<div
			style={ {
				height: '600px',
				position: 'relative',
				display: 'flex',
				justifyContent: 'flex-start',
				alignItems: 'flex-end',
				padding: '16px',
				overflow: 'visible',
				zIndex: 1000,
			} }
		>
			<Chat { ...args } />
		</div>
	),
};

export const Embedded: Story = {
	args: {
		messages: mockMessages,
		isProcessing: false,
		error: null,
		onSubmit: mockOnSubmit,
		variant: 'embedded',
	},
	render: ( args ) => (
		<div
			style={ {
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: '#f0f0f0',
				padding: '2rem',
			} }
		>
			<div
				style={ {
					width: '100%',
					maxWidth: '800px',
					height: '100%',
					maxHeight: '900px',
					position: 'relative',
					backgroundColor: 'white',
					borderRadius: '12px',
					boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
					overflow: 'hidden',
					padding: '1rem',
				} }
			>
				<Chat { ...args } />
			</div>
		</div>
	),
	parameters: {
		layout: 'fullscreen',
	},
};

export const Floating: Story = {
	args: {
		messages: mockMessages,
		isProcessing: false,
		error: null,
		onSubmit: mockOnSubmit,
		variant: 'floating',
	},
};

export const WithEmptyView: Story = {
	args: {
		messages: [], // Empty messages for this story
		isProcessing: false,
		error: null,
		onSubmit: mockOnSubmit,
		variant: 'embedded',
		emptyView: (
			<div
				style={ {
					padding: '2rem',
					textAlign: 'center',
					color: '#666',
				} }
			>
				<h3 style={ { marginBottom: '1rem', color: '#333' } }>
					Welcome to WordPress!
				</h3>
				<p>
					I can help you optimize your site, create content, improve
					SEO, and provide insights about your WordPress site.
				</p>
			</div>
		),
	},
	render: ( args ) => (
		<div
			style={ {
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: '#f0f0f0',
				padding: '2rem',
			} }
		>
			<div
				style={ {
					width: '100%',
					maxWidth: '800px',
					height: '100%',
					maxHeight: '900px',
					position: 'relative',
					backgroundColor: 'white',
					borderRadius: '12px',
					boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
					overflow: 'hidden',
					padding: '1rem',
				} }
			>
				<Chat { ...args } />
			</div>
		</div>
	),
	parameters: {
		layout: 'fullscreen',
	},
};
