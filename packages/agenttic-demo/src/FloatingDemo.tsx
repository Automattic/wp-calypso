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
	CopyIcon,
	ThumbsDownIcon,
	ThumbsUpIcon,
} from '@automattic/agenttic-ui';
import {
	getClientContext,
	getClientTools,
} from '@automattic/agenttic-client/mocks';

// Import chart styles from client package source
import '../../packages/agenttic-client/src/markdown-extensions/charts/charts.css';

const FloatingDemo: React.FC = () => {
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
	} = useAgentChat( {
		agentId: 'test',
		agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
		sessionId: 'dev-session-floating',
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
		},
		[]
	);

	const handleCopy = useCallback( async ( message: UIMessage ) => {
		const textContent = message.content
			.filter( ( item ) => item.type === 'text' )
			.map( ( item ) => item.text )
			.join( '\n' );

		try {
			// @ts-ignore - navigator is available in browser
			await navigator.clipboard.writeText( textContent );
			console.log( 'Message copied to clipboard' );
		} catch ( err ) {
			console.error( 'Failed to copy message:', err );
		}
	}, [] );

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
				up: <ThumbsUpIcon size={ 16 } />,
				down: <ThumbsDownIcon size={ 16 } />,
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

		const copyAction = {
			id: 'copy',
			label: 'Copy message',
			icon: <CopyIcon size={ 16 } />,
			onClick: handleCopy,
			condition: ( message: UIMessage ) => message.role === 'agent',
			tooltip: 'Copy message content',
		};

		registerMessageActions( {
			id: 'demo-copy',
			actions: [ copyAction ],
		} );

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
		handleCopy,
	] );

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
				variant="floating"
				suggestions={ suggestions }
				clearSuggestions={ clearSuggestions }
				messageRenderer={ messageRenderer }
			/>
		</div>
	);
};

export default FloatingDemo;
