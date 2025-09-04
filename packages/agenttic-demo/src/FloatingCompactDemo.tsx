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
	ThumbsDownIcon,
	ThumbsUpIcon,
	ZoomIcon,
	ZoomIconFilled,
} from '@automattic/agenttic-ui';
import {
	getClientContext,
	getClientTools,
} from '@automattic/agenttic-client/mocks';

// Import chart styles from client package source
import '../../packages/agenttic-client/src/markdown-extensions/charts/charts.css';

const FloatingCompactDemo: React.FC = () => {
	const [ contextProvider ] = useState< ContextProvider >( () => ( {
		getClientContext,
	} ) );
	const [ isZoomed, setIsZoomed ] = useState( false );
	const [ feedbackState, setFeedbackState ] = useState<
		Record< string, 'up' | 'down' >
	>( {} );
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
		sessionId: 'dev-session-floating-compact',
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
			setFeedbackState( ( prev ) => {
				const current = prev[ messageId ];
				if ( current === feedback ) {
					// Toggle off if clicking the same feedback
					const { [ messageId ]: _, ...rest } = prev;
					return rest;
				}
				// Set new feedback
				return { ...prev, [ messageId ]: feedback };
			} );
		},
		[]
	);

	const hasRegisteredExtensions = useRef( false );

	// Register extensions and components only once
	useEffect( () => {
		if ( hasRegisteredExtensions.current ) {
			return;
		}

		// Register chart extensions
		registerMarkdownExtensions( customMarkdownExtensions );

		// Register custom markdown components
		registerMarkdownComponents( customMarkdownComponents );

		hasRegisteredExtensions.current = true;
	}, [
		registerMarkdownExtensions,
		registerMarkdownComponents,
		customMarkdownExtensions,
		customMarkdownComponents,
	] );

	const feedbackActions = useCallback(
		( message: UIMessage ) => {
			if ( message.role !== 'agent' ) return [];

			const currentFeedback = feedbackState[ message.id ];

			return [
				{
					id: 'feedback-up',
					icon: <ThumbsUpIcon />,
					label: 'Good response',
					onClick: async () => {
						await handleFeedback( message.id, 'up' );
					},
					tooltip: 'This response was helpful',
					pressed: currentFeedback === 'up',
					disabled: currentFeedback === 'down',
				},
				{
					id: 'feedback-down',
					icon: <ThumbsDownIcon />,
					label: 'Bad response',
					onClick: async () => {
						await handleFeedback( message.id, 'down' );
					},
					tooltip: 'This response was not helpful',
					pressed: currentFeedback === 'down',
					disabled: currentFeedback === 'up',
				},
			];
		},
		[ feedbackState, handleFeedback ]
	);

	// Register feedback actions once
	useEffect( () => {
		registerMessageActions( {
			id: 'demo-feedback',
			actions: feedbackActions,
		} );
	}, [ registerMessageActions, feedbackActions ] );

	useEffect( () => {
		const zoomAction = {
			id: 'zoom-toggle',
			label: isZoomed ? '50%' : '100%',
			showLabel: true,
			icon: isZoomed ? <ZoomIconFilled /> : <ZoomIcon />,
			onClick: () => {
				setIsZoomed( ! isZoomed );
				console.log( 'Zoom toggled:', ! isZoomed );
			},
			condition: ( message: UIMessage ) => message.role === 'agent',
			tooltip: isZoomed ? 'Zoom to 100%' : 'Zoom to 50%',
			pressed: isZoomed,
		};

		registerMessageActions( {
			id: 'demo-zoom',
			actions: [ zoomAction ],
		} );
	}, [ isZoomed, registerMessageActions ] );

	return (
		<div
			// Inline styles are used here to demonstrate how to  theme colors.
			style={ {
				height: '100vh',
				backgroundColor: '#eee',
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
			<AgentUI
				messages={ messages }
				isProcessing={ isProcessing }
				error={ error }
				onSubmit={ handleSubmit }
				onStop={ abortCurrentRequest }
				variant="floating"
				floatingChatState="compact"
				suggestions={ suggestions }
				clearSuggestions={ clearSuggestions }
				messageRenderer={ messageRenderer }
				notice={ {
					message: 'Upgrade now to launch.',
					action: {
						label: 'Subscribe',
						onClick: () => {
							console.log( 'Subscribe' );
						},
					},
				} }
			/>
		</div>
	);
};

export default FloatingCompactDemo;
