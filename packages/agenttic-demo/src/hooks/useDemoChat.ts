import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAgentChat } from '@automattic/agenttic-client';
import type { ContextProvider } from '@automattic/agenttic-client';
import { createMessageRenderer } from '@automattic/agenttic-ui';
import {
	getClientContext,
	getClientTools,
} from '@automattic/agenttic-client/mocks';

// Chart styles are required by the `charts` markdown extension enabled below.
import '../../../packages/agenttic-ui/src/markdown-extensions/charts/charts.css';

interface UseDemoChatOptions {
	sessionId: string;
	enableStreaming?: boolean;
	/**
	 * Custom markdown components forwarded to `createMessageRenderer`.
	 * The renderer is re-created when this reference changes, so memoize it.
	 */
	markdownComponents?: Record< string, React.ComponentType< any > >;
}

/**
 * Shared chat wiring for all playground demos: mock context/tool providers,
 * `useAgentChat` against the test agent, a chart/GFM-enabled message renderer,
 * and a submit handler that clears suggestions.
 *
 * @param options                    Demo chat options.
 * @param options.sessionId          Unique session id per demo view.
 * @param options.enableStreaming    Forwarded to `useAgentChat`.
 * @param options.markdownComponents Custom markdown components for the renderer.
 */
export function useDemoChat( {
	sessionId,
	enableStreaming,
	markdownComponents,
}: UseDemoChatOptions ) {
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

	const chat = useAgentChat( {
		agentId: 'test',
		agentUrl: 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
		sessionId,
		contextProvider,
		toolProvider,
		enableStreaming,
	} );

	const { addMessage, onSubmit, clearSuggestions } = chat;

	useEffect( () => {
		addMessageRef.current = addMessage;
	}, [ addMessage ] );

	const messageRenderer = useMemo(
		() =>
			createMessageRenderer( {
				components: markdownComponents,
				extensions: {
					charts: { enabled: true },
					gfm: { enabled: true },
				},
				enableStreaming: true,
			} ),
		[ markdownComponents ]
	);

	const handleSubmit = useCallback(
		async ( message: string ) => {
			await onSubmit( message );
			clearSuggestions();
		},
		[ onSubmit, clearSuggestions ]
	);

	return { ...chat, messageRenderer, handleSubmit };
}
