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
	createMessageRenderer,
	EmptyView,
	ThumbsDownIcon,
	ThumbsUpIcon,
	ZoomIcon,
	ZoomIconFilled,
} from '@automattic/agenttic-ui';
import {
	getClientContext,
	getClientTools,
} from '@automattic/agenttic-client/mocks';

// Import chart styles from UI package source
import '../../packages/agenttic-ui/src/markdown-extensions/charts/charts.css';
import MessageTester from './MessageTester';

const FloatingCompactDemo: React.FC<{ currentTheme: 'light' | 'dark' }> = ( { currentTheme } ) => {
	const [ contextProvider ] = useState< ContextProvider >( () => ( {
		getClientContext,
	} ) );
	const [ isZoomed, setIsZoomed ] = useState( false );
	const [ freeDragEnabled, setFreeDragEnabled ] = useState( false );
	// Persist the dropped free-drag position so it survives remounts (Remount button below).
	const [ freeDragPosition, setFreeDragPosition ] = useState<
		{ x: number; y: number } | undefined
	>( undefined );
	const [ remountKey, setRemountKey ] = useState( 0 );
	const [ feedbackState, setFeedbackState ] = useState<
		Record< string, 'up' | 'down' >
	>( {} );
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
		sessionId: 'dev-session-floating-compact',
		contextProvider,
		toolProvider,
	} );

	useEffect( () => {
		addMessageRef.current = addMessage;
	}, [ addMessage ] );

	// Create message renderer with chart and GFM extensions
	const messageRenderer = useMemo(
		() =>
			createMessageRenderer( {
				extensions: {
					charts: { enabled: true },
					gfm: { enabled: true },
				},
				enableStreaming: true,
			} ),
		[]
	);

	const suggestionSets = useMemo(
		() => ( {
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
			],
			image: [
				{
					id: '7',
					label: 'Make new image',
					prompt: 'Add an image here',
				},
				{
					id: '8',
					label: 'Replace with uploaded image',
					action: () => {
						return true;
					},
					prompt: 'Replace the current image with an uploaded image',
				},
				{
					id: '9',
					label: 'Add gallery with three images',
					prompt: 'Add a new gallery pattern to the page with three images, right below the currently selected pattern.',
				},
			],
			pattern: [
				{
					id: 'add-overlay',
					label: 'Add overlay',
					prompt: 'Add an overlay to the cover block and give me the color picker tool to change it.',
				},
				{
					id: 'change-pattern-style',
					label: 'Change pattern style',
					prompt: 'Show me the different styles I can apply to this pattern.',
				},
				{
					id: 'show-pattern-layout',
					label: 'Show different layouts',
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
		hasRegisteredExtensions.current = true;
	}, [] );

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

	// Register zoom action with `order: 1` so it appears before feedback actions.
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
			order: 1,
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
				<button
					onClick={ () => setRemountKey( ( prev ) => prev + 1 ) }
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
					Remount
				</button>
				<MessageTester addMessage={ addMessage } onClear={ () => loadMessages( [] ) } />
			</div>
			<AgentUI
				key={ remountKey }
				className={ `agenttic ${ currentTheme }` }
				messages={ messages }
				isProcessing={ isProcessing }
				error={ error }
				onSubmit={ handleSubmit }
				onStop={ abortCurrentRequest }
				variant="floating"
				floatingChatState="compact"
				draggableStates={ [ 'collapsed', 'compact', 'expanded' ] }
				suggestions={ suggestions }
				clearSuggestions={ clearSuggestions }
				messageRenderer={ messageRenderer }
				messagesPosition="bottom"
				expandOnClick={ false }
				notice={ {
					message: 'Upgrade now to launch.',
					action: {
						label: 'Subscribe',
						onClick: () => {
							console.log( 'Subscribe' );
						},
					},
				} }
				emptyView={ <EmptyView suggestions={ suggestions } /> }
				freeDrag={ freeDragEnabled }
				initialFreeDragPosition={ freeDragPosition }
				onFreeDragEnd={ setFreeDragPosition }
			/>
		</div>
	);
};

export default FloatingCompactDemo;
