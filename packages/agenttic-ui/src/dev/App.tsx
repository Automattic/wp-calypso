/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useMemo, useState } from 'react';
import { AgentChat } from '../components/AgentChat';
import { useSuggestions } from '../hooks/useSuggestions';
import type { ContextProvider, ToolProvider } from '../types';
import { getClientContext } from './mockContext';
import { getClientTools } from './mockTools';
import { useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
//import { XIcon } from '../components/icons/XIcon';

const App: React.FC = () => {
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

	// Mock suggestion sets for different contexts
	const suggestionSets = {
		button: [
			{
				id: '1',
				label: 'Edit link',
				prompt: 'Change the button link to:',
			},
			{ id: '2', label: 'Remove button', prompt: 'Remove this button' },
			{
				id: '3',
				label: 'Change color',
				prompt: 'Change the button color to blue',
			},
		],
		heading: [
			{
				id: '4',
				label: 'Make uppercase',
				prompt: 'Make this text uppercase',
			},
			{
				id: '5',
				label: 'Change color',
				prompt: 'Change the text color to:',
			},
			{
				id: '6',
				label: 'Add shadow',
				prompt: 'Add a drop shadow to this text',
			},
		],
		image: [
			{ id: '7', label: 'Add image', prompt: 'Add an image here' },
			{ id: '8', label: 'Add video', prompt: 'Embed a video' },
			{ id: '9', label: 'Add gallery', prompt: 'Create a photo gallery' },
		],
		pattern: [
			{
				id: '10',
				label: 'Apply style',
				prompt: 'Show me the styles for this pattern.',
			},
			{
				id: '11',
				label: 'Change layout',
				prompt: 'Give me alternative layout variations for this pattern, keeping all content and copy exactly the same.',
			},
		],
		none: [],
	};

	const handleContextChange = ( context: keyof typeof suggestionSets ) => {
		setSuggestions( suggestionSets[ context ] );
	};

	const notice = {
		message: 'This is a test notice.',
		action: {
			label: 'Upgrade',
			onClick: () => console.log( 'Notice clicked' ),
		},
		dismissible: true,
		onDismiss: () => console.log( 'Notice dismissed' ),
	};

	// const emptyViewExample = (
	// 	<h2>How can I help you today?</h2>
	// );

	return (
		<div
			style={ { display: 'flex', flexDirection: 'column', gap: '1rem' } }
		>
			<a
				href="#"
				onClick={ ( e ) => {
					e.preventDefault();
					handleContextChange( 'button' );
				} }
			>
				Select Button Block
			</a>
			<a
				href="#"
				onClick={ ( e ) => {
					e.preventDefault();
					handleContextChange( 'heading' );
				} }
			>
				Select Heading Block
			</a>
			<a
				href="#"
				onClick={ ( e ) => {
					e.preventDefault();
					handleContextChange( 'image' );
				} }
			>
				Select Image Block
			</a>
			<a
				href="#"
				onClick={ ( e ) => {
					e.preventDefault();
					handleContextChange( 'pattern' );
				} }
			>
				Select Pattern
			</a>
			<a
				href="#"
				onClick={ ( e ) => {
					e.preventDefault();
					handleContextChange( 'none' );
				} }
			>
				Clear Selection
			</a>

			<AgentChat
				agentId="big-sky"
				agentUrl="https://public-api.wordpress.com/wpcom/v2/ai/agent"
				sessionId={ `dev-session` }
				contextProvider={ contextProvider }
				toolProvider={ toolProvider }
				variant="floating"
				chatState="expanded"
				// notice={ notice }
			/>
		</div>
	);
};

export default App;
