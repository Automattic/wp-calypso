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
				<AgentUI
					messages={ messages }
					isProcessing={ isProcessing }
					error={ error }
					onSubmit={ handleSubmit }
					variant="embedded"
					suggestions={ suggestions }
					clearSuggestions={ clearSuggestions }
					messageRenderer={ messageRenderer }
					// notice={ {
					// 	message: 'This is a notice',
					// } }
				/>
			</div>
		</>
	);
};

export default EmbeddedDemo;
