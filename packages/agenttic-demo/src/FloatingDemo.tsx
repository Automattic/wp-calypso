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
	createFeedbackActions,
	createMessageRenderer,
	EmptyView,
	ThumbsDownIcon,
	ThumbsUpIcon,
} from '@automattic/agenttic-ui';
import type { ChatState } from '@automattic/agenttic-ui';
import {
	getClientContext,
	getClientTools,
} from '@automattic/agenttic-client/mocks';

// Import chart styles from UI package source
import '../../packages/agenttic-ui/src/markdown-extensions/charts/charts.css';
import MessageTester from './MessageTester';

const FloatingDemo: React.FC< {
	currentTheme: 'light' | 'dark';
	floatingChatState?: ChatState;
	triggerTitle?: string;
} > = ( { currentTheme, floatingChatState, triggerTitle } ) => {
	const [ contextProvider ] = useState< ContextProvider >( () => ( {
		getClientContext,
	} ) );

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
		addMessage,
		loadMessages,
		abortCurrentRequest,
	} = useAgentChat( {
		agentId: 'test',
		agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
		sessionId: 'dev-session-floating',
		contextProvider,
		toolProvider,
	} );

	useEffect( () => {
		addMessageRef.current = addMessage;
	}, [ addMessage ] );

	const [ showSuggestions, setShowSuggestions ] = useState( true );
	const [ freeDragEnabled, setFreeDragEnabled ] = useState( false );
	const [ freeDragPosition, setFreeDragPosition ] = useState<
		{ x: number; y: number } | undefined
	>( undefined );

	const defaultSuggestions = useMemo(
		() => [
			{
				id: '1',
				label: 'Edit link',
				prompt: 'Change the button link to:',
				options: [
					{ id: 'color-blue', label: 'Blue', value: 'blue' },
					{ id: 'color-red', label: 'Red', value: 'red' },
					{ id: 'color-green', label: 'Green', value: 'green' },
				],
			},
			{ id: '2', label: 'Remove button', prompt: 'Remove this button' },
			{
				id: '3',
				label: 'Change color',
				prompt: 'Change the button color to ',
				options: [
					{ id: 'color-blue', label: 'Blue', value: 'blue' },
					{ id: 'color-red', label: 'Red', value: 'red' },
					{ id: 'color-green', label: 'Green', value: 'green' },
				],
			},
		],
		[]
	);

	// Register or clear suggestions based on toggle
	useEffect( () => {
		if ( showSuggestions ) {
			registerSuggestions( defaultSuggestions );
		} else {
			clearSuggestions();
		}
	}, [
		showSuggestions,
		registerSuggestions,
		clearSuggestions,
		defaultSuggestions,
	] );

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

		const copyAction = {
			id: 'copy',
			label: 'Copy message',
			icon: <CopyIcon />,
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
	}, [ registerMessageActions, handleFeedback, handleCopy ] );

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
					onClick={ () => setShowSuggestions( ( prev ) => ! prev ) }
					style={ {
						padding: '8px 10px',
						background: showSuggestions ? '#000' : 'white',
						color: showSuggestions ? '#fff' : '#000',
						cursor: 'pointer',
						fontSize: '12px',
						fontFamily: 'monospace',
						textTransform: 'uppercase',
					} }
				>
					Suggestions
				</button>
				<button
					onClick={ () => setFreeDragEnabled( ( prev ) => ! prev ) }
					style={ {
						padding: '4px 8px',
						background: freeDragEnabled ? '#0a0' : '#000',
						color: '#fff',
						cursor: 'pointer',
						fontSize: '12px',
						fontFamily: 'monospace',
						textTransform: 'uppercase',
					} }
				>
					Free Drag: { freeDragEnabled ? 'ON' : 'OFF' }
				</button>
				<MessageTester
					addMessage={ addMessage }
					onClear={ () => loadMessages( [] ) }
				/>
			</div>
			<AgentUI
				className={ `agenttic ${ currentTheme }` }
				messages={ messages }
				isProcessing={ isProcessing }
				error={ error }
				onSubmit={ handleSubmit }
				onStop={ abortCurrentRequest }
				variant="floating"
				floatingChatState={ floatingChatState }
				triggerTitle={ triggerTitle }
				suggestions={ suggestions }
				clearSuggestions={ clearSuggestions }
				messageRenderer={ messageRenderer }
				expandOnClick={ false }
				locale="en"
				messagesPosition="bottom"
				emptyView={ <EmptyView suggestions={ suggestions } /> }
				freeDrag={ freeDragEnabled }
				initialFreeDragPosition={ freeDragPosition }
				onFreeDragEnd={ setFreeDragPosition }
			/>
		</div>
	);
};

export default FloatingDemo;
