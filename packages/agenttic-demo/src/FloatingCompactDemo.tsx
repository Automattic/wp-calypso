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
		registerMessageActions,
		addMessage,
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
				draggableStates={ [ 'collapsed', 'compact', 'expanded' ] }
				suggestions={ suggestions }
				clearSuggestions={ clearSuggestions }
				messageRenderer={ messageRenderer }
				expandOnClick={ false }
				notice={ {
					// icon: (
					// 	<svg
					// 		xmlns="http://www.w3.org/2000/svg"
					// 		width="18"
					// 		height="18"
					// 		viewBox="0 0 18 18"
					// 		fill="none"
					// 	>
					// 		<path
					// 			d="M8.4375 12V10.875H9.5625V12H8.4375Z"
					// 			fill="#1F1F1F"
					// 		/>
					// 		<path
					// 			d="M8.4375 6L8.4375 9.75H9.5625V6L8.4375 6Z"
					// 			fill="#1F1F1F"
					// 		/>
					// 		<path
					// 			fill-rule="evenodd"
					// 			clip-rule="evenodd"
					// 			d="M9 3C5.68629 3 3 5.68629 3 9C3 12.3137 5.68629 15 9 15C12.3137 15 15 12.3137 15 9C15 5.68629 12.3137 3 9 3ZM4.125 9C4.125 11.6924 6.30761 13.875 9 13.875C11.6924 13.875 13.875 11.6924 13.875 9C13.875 6.30761 11.6924 4.125 9 4.125C6.30761 4.125 4.125 6.30761 4.125 9Z"
					// 			fill="#1F1F1F"
					// 		/>
					// 	</svg>
					// ),
					message: 'Upgrade now to launch.',
					action: {
						label: 'Subscribe',
						onClick: () => {
							console.log( 'Subscribe' );
						},
					},
					dismissible: true,
					onDismiss: () => {},
					status: 'error',
				} }
				emptyView={ <EmptyView suggestions={ suggestions } /> }
			/>
		</div>
	);
};

export default FloatingCompactDemo;
