/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useAgentChat } from '@automattic/agenttic-client';
import type { ContextProvider } from '@automattic/agenttic-client';
import { AgentUI } from '@automattic/agenttic-ui';
import { getClientContext } from '@automattic/agenttic-client/mocks/mockContext';
import { getClientTools } from '@automattic/agenttic-client/mocks/mockTools';

// Import chart styles from client package source
import '../../packages/agenttic-client/src/markdown-extensions/charts/charts.css';

const App: React.FC = () => {
	// Create context provider
	const [ contextProvider ] = useState< ContextProvider >( () => ( {
		getClientContext,
	} ) );

	// Create a ref to store addMessage so it can be used in toolProvider closure
	const addMessageRef = useRef< ( ( message: any ) => void ) | null >( null );

	// Initialize the agent chat hook
	const {
		messages,
		isProcessing,
		error,
		onSubmit,
		suggestions,
		registerSuggestions,
		clearSuggestions,
		registerMarkdownComponents,
		registerMarkdownExtensions,
		addMessage,
		markdownComponents,
	} = useAgentChat( {
		agentId: 'test',
		agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
		sessionId: 'dev-session',
		contextProvider,
		toolProvider: getClientTools( ( message ) => {
			if ( addMessageRef.current ) {
				addMessageRef.current( message );
			}
		} ),
	} );

	// Update the ref when addMessage becomes available
	useEffect( () => {
		addMessageRef.current = addMessage;
	}, [ addMessage ] );

	// Mock suggestion sets for different contexts - memoized to prevent re-renders
	const suggestionSets = useMemo(
		() => ( {
			button: [
				{
					id: '1',
					label: 'Edit link',
					prompt: 'Change the button link to:',
				},
				{
					id: '2',
					label: 'Remove button',
					prompt: 'Remove this button',
				},
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
				{
					id: '9',
					label: 'Add gallery',
					prompt: 'Create a photo gallery',
				},
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
		} ),
		[]
	);

	const handleContextChange = useCallback(
		( context: keyof typeof suggestionSets ) => {
			registerSuggestions( suggestionSets[ context ] );
		},
		[ registerSuggestions, suggestionSets ]
	);

	// Custom markdown components for demo
	const customMarkdownComponents = useMemo(
		() => ( {
			// Custom blockquote with left border and styling
			blockquote: ( { children, ...props }: any ) => (
				<blockquote
					{ ...props }
					style={ {
						borderLeft: '4px solid #007cba',
						backgroundColor: '#f0f8ff',
						margin: '16px 0',
						padding: '12px 16px',
						fontStyle: 'italic',
						borderRadius: '0 4px 4px 0',
					} }
				>
					{ children }
				</blockquote>
			),
		} ),
		[]
	);

	// Memoize the markdown extensions object to prevent re-renders
	const customMarkdownExtensions = useMemo(
		() => ( {
			charts: {
				enabled: true,
			},
		} ),
		[]
	);

	// Create a wrapper onSubmit that clears suggestions after submitting
	const handleSubmit = useCallback(
		async ( message: string ) => {
			await onSubmit( message );
			clearSuggestions();
		},
		[ onSubmit, clearSuggestions ]
	);

	// Track if we've already registered to avoid re-registration
	const hasRegistered = useRef( false );

	// Register both extensions and components on app load - only once
	useEffect( () => {
		if ( hasRegistered.current ) {
			return;
		}

		// Register chart extensions
		registerMarkdownExtensions( customMarkdownExtensions );

		// Register custom markdown components
		registerMarkdownComponents( customMarkdownComponents );

		hasRegistered.current = true;
	}, [
		registerMarkdownExtensions,
		registerMarkdownComponents,
		customMarkdownExtensions,
		customMarkdownComponents,
	] );

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

			<AgentUI
				messages={ messages }
				isProcessing={ isProcessing }
				error={ error }
				onSubmit={ handleSubmit }
				variant="floating"
				suggestions={ suggestions }
				clearSuggestions={ clearSuggestions }
				markdownComponents={ markdownComponents }
			/>
		</div>
	);
};

export default App;
