import type { Meta, StoryObj } from '@storybook/react';
import React, { useMemo, useState } from 'react';
import { AgentChat } from '../AgentChat';
import type { ContextProvider, ToolProvider } from '../../types';
import { getClientContext } from '../../dev/mockContext';
import { getClientTools } from '../../dev/mockTools';
import { useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../../store';
import { useSuggestions } from '../../hooks/useSuggestions';
import { MockProviders } from '../../mocks/providers';

const meta = {
	title: 'Chat/Chat/AgentChat',
	component: AgentChat,
	parameters: {
		layout: 'fullscreen',
	},
	tags: [ 'autodocs' ],
	argTypes: {
		agentId: {
			control: 'text',
		},
		agentUrl: {
			control: 'text',
		},
		sessionId: {
			control: 'text',
		},
		variant: {
			control: 'select',
			options: [ 'floating', 'embedded' ],
		},
		chatState: {
			control: 'select',
			options: [ 'collapsed', 'expanded' ],
		},
		placeholder: {
			control: 'text',
		},
		contextProvider: { table: { disable: true } },
		toolProvider: { table: { disable: true } },
		authProvider: { table: { disable: true } },
		notice: { table: { disable: true } },
		emptyView: { table: { disable: true } },
		triggerIcon: { table: { disable: true } },
	},
} satisfies Meta< typeof AgentChat >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	decorators: [
		( Story: React.ComponentType ) => (
			<MockProviders>
				<Story />
			</MockProviders>
		),
	],
	render: ( args ) => {
		const Component = () => {
			const dispatch = useDispatch( STORE_NAME );
			const { setSuggestions } = useSuggestions();

			const [ contextProvider ] = useState< ContextProvider >( () => {
				return {
					getClientContext,
				};
			} );

			const toolProvider = useMemo< ToolProvider >( () => {
				const tools = getClientTools( dispatch.addMessage );
				return {
					getAvailableTools: tools.getAvailableTools,
					executeTool: tools.executeTool,
				};
			}, [ dispatch.addMessage ] );

			// Set some default suggestions
			React.useEffect( () => {
				setSuggestions( [
					{
						id: '1',
						label: 'Site analytics',
						prompt: 'Show me my site analytics for this month',
					},
					{
						id: '2',
						label: 'Content optimization',
						prompt: 'Help me optimize my content for better engagement',
					},
				] );
			}, [ setSuggestions ] );

			return (
				<div style={ { height: '100vh', position: 'relative' } }>
					<AgentChat
						{ ...args }
						contextProvider={ contextProvider }
						toolProvider={ toolProvider }
					/>
				</div>
			);
		};

		return <Component />;
	},
	args: {
		agentId: 'big-sky',
		agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
		sessionId: `storybook-session-${ Date.now() }`,
		variant: 'floating',
		chatState: 'expanded',
		placeholder: 'Ask me anything...',
	},
};
