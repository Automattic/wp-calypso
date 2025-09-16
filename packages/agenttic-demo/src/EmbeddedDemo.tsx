import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useAgentChat } from '@automattic/agenttic-client';
import type { ContextProvider, UIMessage } from '@automattic/agenttic-client';
import { AgentUI, ThumbsDownIcon, ThumbsUpIcon } from '@automattic/agenttic-ui';
import {
	getClientContext,
	getClientTools,
} from '@automattic/agenttic-client/mocks';

// Import chart styles from client package source
import '../../packages/agenttic-client/src/markdown-extensions/charts/charts.css';

const EmbeddedDemo: React.FC = () => {
	const [ contextProvider ] = useState< ContextProvider >( () => ( {
		getClientContext,
	} ) );

	const addMessageRef = useRef< ( ( message: any ) => void ) | null >( null );

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
		registerMessageActions,
		createFeedbackActions,
		addMessage,
		messageRenderer,
		abortCurrentRequest,
	} = useAgentChat( {
		agentId: 'test',
		agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
		sessionId: 'dev-session-embedded',
		contextProvider,
		toolProvider: getClientTools( ( message ) => {
			if ( addMessageRef.current ) {
				addMessageRef.current( message );
			}
		} ),
	} );

	useEffect( () => {
		addMessageRef.current = addMessage;
	}, [ addMessage ] );

	// Sample suggestions for embedded demo
	const sampleSuggestions = useMemo(
		() => [
			{
				id: '1',
				label: 'Create a blog post',
				prompt: 'Help me create a blog post about web development',
			},
			{
				id: '2',
				label: 'Design tips',
				prompt: 'Give me some design tips for my website',
			},
			{
				id: '3',
				label: 'SEO advice',
				prompt: 'How can I improve my website SEO?',
			},
		],
		[]
	);

	// Register suggestions on mount
	useEffect( () => {
		registerSuggestions( sampleSuggestions );
	}, [ registerSuggestions, sampleSuggestions ] );

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
			gfm: {
				enabled: true, // Enables tables, strikethrough, task lists, autolinks
			},
		} ),
		[]
	);

	const handleSubmit = useCallback(
		async ( message: string ) => {
			await onSubmit( message );
			clearSuggestions();
		},
		[ onSubmit, clearSuggestions ]
	);

	const handleFeedback = useCallback(
		async ( messageId: string, feedback: 'up' | 'down' ) => {
			console.log( `Feedback for message ${ messageId }: ${ feedback }` );
		},
		[]
	);

	const hasRegistered = useRef( false );

	useEffect( () => {
		if ( hasRegistered.current ) {
			return;
		}

		// Register chart extensions
		registerMarkdownExtensions( customMarkdownExtensions );

		// Register custom markdown components
		registerMarkdownComponents( customMarkdownComponents );

		const feedbackManager = createFeedbackActions( {
			onFeedback: handleFeedback,
			condition: ( message ) => message.role === 'agent',
			icons: {
				up: <ThumbsUpIcon />,
				down: <ThumbsDownIcon />,
			},
		} );
		const feedbackRegistration = {
			id: 'demo-feedback',
			actions: ( message: UIMessage ) =>
				feedbackManager.getActionsForMessage( message ),
		};
		registerMessageActions( feedbackRegistration );

		const handleFeedbackChange = () => {
			registerMessageActions( { ...feedbackRegistration } );
		};
		feedbackManager.onChange( handleFeedbackChange );

		hasRegistered.current = true;

		return () => {
			feedbackManager.offChange( handleFeedbackChange );
		};
	}, [
		registerMarkdownExtensions,
		registerMarkdownComponents,
		customMarkdownExtensions,
		customMarkdownComponents,
		registerMessageActions,
		createFeedbackActions,
		handleFeedback,
	] );
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

	const handleSuggestionSelect = useCallback( ( message: string ) => {
		console.log( 'Selected suggestion:', message );
	}, [] );

	return (
		<>
			<style>
				{ `
                :root {
                    --color-brand: #030AB2;
                }
                body {
                    background-color: var(--color-brand);
                }
                .agenttic {
                    --color-background: var(--color-brand);
                    --color-foreground: oklch(1 0 0);
                    --color-primary: oklch(1 0 0);
                    --color-primary-foreground: var(--color-background);
                }
                .agenttic [data-slot="chat-footer"] {
                    --color-background: oklch(1 0 0);
                    --color-foreground: oklch(0.241 0 0);
                    --color-primary: var(--color-brand);
                    --color-primary-foreground: oklch(1 0 0);
                    --color-muted: oklch(0.925 0 0);
                    --color-muted-foreground: oklch(0.6 0 0);
                }
                
                /* Override suggestions positioning to appear below footer */
                .embedded-demo .agenttic [data-slot="conversation-view"] > div:last-child {
                    position: static !important;
                    transform: none !important;
                    margin-top: var(--spacing-2);
                    padding: var(--spacing-2);
                }
                ` }
			</style>
			<div
				className="embedded-demo"
				style={ {
					height: '100vh',
					padding: '1.5rem',
					maxWidth: '660px',
					margin: '0 auto',
				} }
			>
				<div
					style={ {
						position: 'fixed',
						top: '0',
						right: '0',
						display: 'flex',
						flexWrap: 'wrap',
						gap: '2px',
					} }
				>
					<button
						onClick={ () => handleContextChange( 'heading' ) }
						style={ {
							padding: '8px 10px',
							background: '#000',
							color: '#fff',
							cursor: 'pointer',
							fontSize: '12px',
							fontFamily: 'monospace',
							textTransform: 'uppercase',
						} }
					>
						Heading
					</button>
					<button
						onClick={ () => handleContextChange( 'image' ) }
						style={ {
							padding: '4px 8px',
							background: '#000',
							color: '#fff',
							cursor: 'pointer',
							fontSize: '12px',
							fontFamily: 'monospace',
							textTransform: 'uppercase',
						} }
					>
						Image
					</button>
					<button
						onClick={ () => handleContextChange( 'pattern' ) }
						style={ {
							padding: '4px 8px',
							background: '#000',
							color: '#fff',
							cursor: 'pointer',
							fontSize: '12px',
							fontFamily: 'monospace',
							textTransform: 'uppercase',
						} }
					>
						Pattern
					</button>
				</div>
				<AgentUI.Container
					messages={ messages }
					isProcessing={ isProcessing }
					error={ error }
					onSubmit={ handleSubmit }
					onStop={ abortCurrentRequest }
					variant="embedded"
					suggestions={ suggestions }
					clearSuggestions={ clearSuggestions }
					messageRenderer={ messageRenderer }
					className="agenttic"
					placeholder={ [
						'Ask me anything',
						'How can I help you today?',
						'What would you like to create?',
						'Need help with your website?',
						"Let's build something amazing",
					] }
				>
					<AgentUI.ConversationView showHeader={ false }>
						<AgentUI.Messages />
						<AgentUI.Footer>
							<AgentUI.Notice />
							<AgentUI.Input />
						</AgentUI.Footer>
						<AgentUI.Suggestions
							onSelect={ handleSuggestionSelect }
						/>
					</AgentUI.ConversationView>
				</AgentUI.Container>
			</div>
		</>
	);
};

export default EmbeddedDemo;
