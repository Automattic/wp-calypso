import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useAgentChat } from '@automattic/agenttic-client';
import type { ContextProvider, UIMessage } from '@automattic/agenttic-client';
import {
	AgentUI,
	createFeedbackActions,
	createMessageRenderer,
	EmptyView,
	ImageUploader,
	RegenerateAltIcon,
	ThumbsDownIcon,
	ThumbsUpIcon,
} from '@automattic/agenttic-ui';
import type { UploadedImage } from '@automattic/agenttic-ui';
import {
	getClientContext,
	getClientTools,
} from '@automattic/agenttic-client/mocks';

// Import chart styles from UI package source
import '../../packages/agenttic-ui/src/markdown-extensions/charts/charts.css';
import DemoMoreMenu from './DemoMoreMenu';
import MessageTester from './MessageTester';

const EmbeddedDemo: React.FC< { currentTheme: 'light' | 'dark' } > = ( {
	currentTheme,
} ) => {
	const [ contextProvider ] = useState< ContextProvider >( () => ( {
		getClientContext,
	} ) );

	const [ manualThinkingMessage, setManualThinkingMessage ] = useState<
		string | undefined
	>();

	const [ isTyping, setIsTyping ] = useState( false );
	const [ uploadedImages, setUploadedImages ] = useState< UploadedImage[] >(
		[]
	);

	const addMessageRef = useRef< ( ( message: any ) => void ) | null >( null );

	const toolProvider = useMemo(
		() =>
			getClientTools( ( message ) => {
				if ( addMessageRef.current ) {
					addMessageRef.current( message );
				}
			} ),
		[]
	);

	const {
		messages,
		isProcessing,
		error,
		onSubmit,
		suggestions,
		registerSuggestions,
		clearSuggestions,
		registerMessageActions,
		getRegenerateHandler,
		addMessage,
		loadMessages,
		abortCurrentRequest,
	} = useAgentChat( {
		agentId: 'test',
		agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
		sessionId: 'dev-session-embedded',
		contextProvider,
		toolProvider,
		enableStreaming: true,
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
						backgroundColor:
							currentTheme === 'dark' ? '#0d375c' : '#f0f8ff',
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
		[ currentTheme ]
	);

	// Create custom message renderer with markdown components and extensions
	const messageRenderer = useMemo(
		() =>
			createMessageRenderer( {
				components: customMarkdownComponents,
				extensions: {
					charts: {
						enabled: true,
					},
					gfm: {
						enabled: true, // Enables tables, strikethrough, task lists, autolinks
					},
				},
				enableStreaming: true,
			} ),
		[ customMarkdownComponents ]
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

		const feedbackManager = createFeedbackActions( {
			onFeedback: handleFeedback,
			condition: ( message: UIMessage ) => message.role === 'agent',
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

		// Register a demo "more menu" component action on agent messages.
		// Uses `order` to control position — lower values appear first.
		// Feedback actions have no `order` so they appear at the end.
		registerMessageActions( {
			id: 'demo-more-menu',
			actions: ( message: UIMessage ) => {
				if ( message.role !== 'agent' ) {
					return [];
				}
				return [
					{
						type: 'component' as const,
						id: 'more-menu',
						component: DemoMoreMenu,
						order: 1,
					},
				];
			},
		} );

		hasRegistered.current = true;

		return () => {
			feedbackManager.offChange( handleFeedbackChange );
		};
	}, [ registerMessageActions, handleFeedback ] );

	useEffect( () => {
		registerMessageActions( {
			id: 'demo-regenerate',
			actions: ( message: UIMessage ) => {
				const onRegenerate = getRegenerateHandler( message );

				return onRegenerate
					? [
							{
								id: 'regenerate',
								label: 'Regenerate',
								tooltip: 'Regenerate response',
								icon: <RegenerateAltIcon />,
								order: 2,
								onClick: onRegenerate,
							},
					  ]
					: [];
			},
		} );
	}, [ getRegenerateHandler, registerMessageActions ] );

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

	const handleFilesSelected = useCallback( ( files: File[] ) => {
		// Simulate upload by creating object URLs
		const newImages: UploadedImage[] = files.map( ( file, index ) => ( {
			id: `${ Date.now() }-${ index }`,
			url: URL.createObjectURL( file ),
			name: file.name,
			mime_type: file.type,
		} ) );
		setUploadedImages( ( prev ) => [ ...prev, ...newImages ] );
	}, [] );

	const handleRemoveImage = useCallback( ( image: UploadedImage ) => {
		setUploadedImages( ( prev ) =>
			prev.filter( ( img ) => img.id !== image.id )
		);
		// Revoke the object URL to free memory
		URL.revokeObjectURL( image.url );
	}, [] );

	return (
		<>
			<style>
				{ `
                body {
                    background-color: ${
						currentTheme === 'dark' ? '#1F1F1F' : '#FCFCFC'
					};
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
						zIndex: 9999,
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
					<MessageTester
						addMessage={ addMessage }
						loadMessages={ loadMessages }
						onClear={ () => loadMessages( [] ) }
					/>
					<button
						onClick={ () => {
							setManualThinkingMessage(
								'Testing progress message...'
							);
							setTimeout(
								() => setManualThinkingMessage( undefined ),
								3000
							);
						} }
						style={ {
							padding: '4px 8px',
							background: '#ff0000',
							color: '#fff',
							cursor: 'pointer',
							fontSize: '12px',
							fontFamily: 'monospace',
							textTransform: 'uppercase',
						} }
					>
						Test Progress
					</button>
					<div
						style={ {
							marginLeft: '10px',
							display: 'inline-block',
						} }
					>
						<strong>Typing Status:</strong>{ ' ' }
						{ isTyping ? '✍️ Typing...' : '💤 Not typing' }
					</div>
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
					className={ `agenttic ${ currentTheme }` }
					placeholder={ [
						'Ask me anything',
						'How can I help you today?',
						'What would you like to create?',
						'Need help with your website?',
						"Let's build something amazing",
					] }
					emptyView={ <EmptyView suggestions={ suggestions } /> }
					thinkingMessage={ manualThinkingMessage }
					onTypingStatusChange={ setIsTyping }
				>
					<AgentUI.ConversationView showHeader={ false }>
						<AgentUI.Messages />
						<AgentUI.Footer>
							<AgentUI.Notice />
							<ImageUploader
								images={ uploadedImages }
								onFilesSelected={ handleFilesSelected }
								onRemoveImage={ handleRemoveImage }
								acceptedFileTypes={ [
									'image/jpeg',
									'image/png',
									'image/gif',
									'image/webp',
								] }
								showFileMetadata={ true }
							/>
							<AgentUI.Input />
							<AgentUI.InputToolbar label="Custom Toolbar">
								<div>
									<p>This is a custom input toolbar.</p>
								</div>
							</AgentUI.InputToolbar>
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
