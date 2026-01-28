import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAgentChat } from '@automattic/agenttic-client';
import type { ContextProvider } from '@automattic/agenttic-client';
import { AgentUI } from '@automattic/agenttic-ui';
import type { Suggestion } from '@automattic/agenttic-ui';
import {
	getClientContext,
	getClientTools,
} from '@automattic/agenttic-client/mocks';

/**
 * Site Spec Demo
 *
 * This demo replicates the layout used in the site-spec project:
 * - Embedded variant
 * - Horizontal suggestions appearing BELOW the input box
 * - Default suggestions shown on load
 *
 * This uses the EXACT same pattern as site-spec-chat.tsx to ensure
 * any regressions in the horizontal layout are caught.
 */
const SiteSpecDemo: React.FC< { currentTheme: 'light' | 'dark' } > = ( {
	currentTheme,
} ) => {
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
		clearSuggestions,
		addMessage,
		abortCurrentRequest,
	} = useAgentChat( {
		agentId: 'test',
		agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
		sessionId: 'dev-session-sitespec',
		contextProvider,
		toolProvider,
		enableStreaming: true,
	} );

	useEffect( () => {
		addMessageRef.current = addMessage;
	}, [ addMessage ] );

	// Default suggestions matching site-spec style
	const defaultPromptSuggestions: Suggestion[] = useMemo(
		() => [
			{
				id: '1',
				label: 'Launch a nonprofit site',
				prompt: 'Launch a nonprofit site',
			},
			{
				id: '2',
				label: 'Start a travel blog',
				prompt: 'Start a travel blog',
			},
			{
				id: '3',
				label: 'Create a restaurant website',
				prompt: 'Create a restaurant website',
			},
			{
				id: '4',
				label: 'Launch a coaching site',
				prompt: 'Launch a coaching site',
			},
			{
				id: '5',
				label: 'Design a coffee shop site',
				prompt: 'Design a coffee shop site',
			},
		],
		[]
	);

	// Compute promptSuggestions - use agent suggestions if available, otherwise defaults
	// This is the EXACT pattern from site-spec-chat.tsx
	const promptSuggestions: Suggestion[] = useMemo( () => {
		if ( suggestions && suggestions.length ) {
			return suggestions.slice( 0, 5 );
		}
		return defaultPromptSuggestions;
	}, [ suggestions, defaultPromptSuggestions ] );

	const handleSubmit = useCallback(
		async ( message: string ) => {
			await onSubmit( message );
			clearSuggestions();
		},
		[ onSubmit, clearSuggestions ]
	);

	const handleSuggestionSelect = useCallback( ( message: string ) => {
		console.log( 'Selected suggestion:', message );
	}, [] );

	const isOnboarding = messages.length === 0;

	return (
		<>
			<style>
				{ `
				.site-spec-demo {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					min-height: 100vh;
					padding: 60px 24px 24px;
					background: linear-gradient(180deg, #1a0dab 0%, #3023d8 100%);
				}

				.site-spec-demo__header {
					text-align: center;
					margin-bottom: 32px;
				}

				.site-spec-demo__icon {
					font-size: 48px;
					margin-bottom: 24px;
					color: #fff;
				}

				.site-spec-demo__title {
					font-size: 36px;
					font-weight: 500;
					margin: 0;
					color: #fff;
					line-height: 1.2;
				}

				.site-spec-demo__chat {
					width: 100%;
					max-width: 680px;
				}

				/* Style the input container */
				.site-spec-demo .agenttic {
					background: transparent;
				}

				.site-spec-demo .agenttic [data-slot="footer"] {
					background: #fff;
					border-radius: 12px;
					padding: 16px;
					box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
				}

				.site-spec-demo .agenttic [data-slot="chat-input"] {
					background: transparent;
					border: none;
				}

				.site-spec-demo .agenttic [data-slot="chat-input"] textarea {
					background: transparent;
				}

				/* PromptSuggestions wrapper - matches site-spec exactly */
				.site-spec-demo__prompt-suggestions {
					margin: 30px 0 auto;
				}

				/* The Suggestions component renders a container div; make it centered and wrap */
				.site-spec-demo__prompt-suggestions > div {
					position: static !important;
					transform: none !important;
					display: flex;
					gap: 8px;
					max-width: 640px;
					flex-wrap: wrap;
					justify-content: center;
					padding: 0 !important;
				}

				/* Pill buttons inspired by site-spec */
				.site-spec-demo__prompt-suggestions button {
					all: unset;
					display: inline-flex;
					align-items: center;
					justify-content: center;
					box-sizing: border-box;
					padding: 12px 16px !important;
					max-width: 100%;
					height: 100%;
					cursor: pointer;
					border-radius: 100px !important;
					font-size: 14px !important;
					line-height: 1.25 !important;
					transition: background-color 0.2s ease, box-shadow 0.2s ease;
					color: #fff !important;
					box-shadow: 0 0 1px 2px rgba(0, 0, 0, 0.05);
					background-color: rgba(255, 255, 255, 0.075) !important;
					border: 0.5px solid rgba(255, 255, 255, 0.08) !important;
				}

				.site-spec-demo__prompt-suggestions button:hover {
					background-color: rgba(255, 255, 255, 0.1) !important;
					box-shadow: 0 10px 28px rgba(3, 10, 178, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.2);
				}
				` }
			</style>
			<div className="site-spec-demo">
				{ isOnboarding && (
					<div className="site-spec-demo__header">
						<div className="site-spec-demo__icon">✦</div>
						<h1 className="site-spec-demo__title">
							Make a website as
							<br />
							unique as you.
						</h1>
					</div>
				) }
				<div className="site-spec-demo__chat">
					<AgentUI.Container
						messages={ messages }
						isProcessing={ isProcessing }
						error={ error }
						onSubmit={ handleSubmit }
						onStop={ abortCurrentRequest }
						variant="embedded"
						suggestions={ promptSuggestions }
						clearSuggestions={ clearSuggestions }
						className="agenttic"
						placeholder={ [
							'Start a travel blog...',
							'Launch a nonprofit site...',
							'Create a restaurant website...',
						] }
					>
						<AgentUI.ConversationView showHeader={ false }>
							<AgentUI.Messages />
							<AgentUI.Footer>
								<AgentUI.Notice />
								<AgentUI.Input />
							</AgentUI.Footer>
							{ /* Suggestions below input - exact pattern from site-spec */ }
							{ promptSuggestions.length > 0 && (
								<div className="site-spec-demo__prompt-suggestions">
									<AgentUI.Suggestions
										onSelect={ handleSuggestionSelect }
										showSuggestions={ true }
									/>
								</div>
							) }
						</AgentUI.ConversationView>
					</AgentUI.Container>
				</div>
			</div>
		</>
	);
};

export default SiteSpecDemo;
