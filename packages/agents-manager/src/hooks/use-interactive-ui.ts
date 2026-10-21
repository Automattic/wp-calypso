import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { attachInteractiveUiPresentation } from '../interactive-ui/convert-interactive-ui-messages-to-components';
import { getInteractiveUiBatches } from '../interactive-ui/interactive-ui-messages';
import type { AgentsManagerUIMessage } from '../utils/convert-tool-messages-to-components';
import type { AgentConfig } from '../utils/create-agent-config';
import type { UIMessage, SubmitOptions } from '@automattic/agenttic-client';
import type { InteractiveUiRuntime } from '@automattic/ai-ui-renderer';

interface UseInteractiveUiOptions {
	convertedMessages: AgentsManagerUIMessage[];
	messages: UIMessage[];
	conversationId: string;
	isProcessing: boolean;
	agentConfig: AgentConfig | null;
	submitContextMessage: ( message: string, options: SubmitOptions ) => Promise< void >;
}

export interface InteractiveUiPresentation {
	runtime: InteractiveUiRuntime | undefined;
	sdk: typeof import( '@automattic/ai-ui-renderer' ) | undefined;
	hasLoadError: boolean;
	retryLoad: () => void;
	revision: number;
	isDisabled: boolean;
}

/**
 * Runs the interactive UI forms in agent replies: loads the SDK on demand, so
 * chats without a form don't pay for it; feeds the runtime the message batches
 * only after the stream ends, so a form is never applied mid-stream; sends the
 * forms' actions without showing them as chat messages; and returns the
 * transcript with the forms attached. Keeps the user's input when new messages
 * arrive, and rebuilds the UI if earlier messages change. Reports SDK loading
 * failures so forms can offer a retry.
 */
export function useInteractiveUi( {
	messages,
	convertedMessages,
	conversationId,
	isProcessing,
	agentConfig,
	submitContextMessage,
}: UseInteractiveUiOptions ) {
	const actionInputsRef = useRef( { agentConfig, isProcessing, submitContextMessage } );
	actionInputsRef.current = { agentConfig, isProcessing, submitContextMessage };

	const [ interactiveUiSdk, setInteractiveUiSdk ] =
		useState< typeof import( '@automattic/ai-ui-renderer' ) >();
	const [ hasLoadError, setHasLoadError ] = useState( false );
	const [ runtimeRevision, setRuntimeRevision ] = useState( 0 );

	const messageBatches = useMemo( () => getInteractiveUiBatches( messages ), [ messages ] );
	const hasMessageBatches = messageBatches.length > 0;

	const conversationSession = useMemo(
		() => ( {
			conversationId: conversationId,
			runtime: undefined as InteractiveUiRuntime | undefined,
			processedBatchSignatures: [] as string[],
		} ),
		[ conversationId ]
	);

	// Load the interactive UI SDK dynamically to reduce the initial bundle size.
	useEffect( () => {
		if ( ! hasMessageBatches || interactiveUiSdk || hasLoadError ) {
			return;
		}

		let isUiLoadCancelled = false;
		void import( /* webpackChunkName: "am-interactive-ui" */ '@automattic/ai-ui-renderer' ).then(
			( interactiveUiModule ) => ! isUiLoadCancelled && setInteractiveUiSdk( interactiveUiModule ),
			() => ! isUiLoadCancelled && setHasLoadError( true )
		);

		return () => {
			isUiLoadCancelled = true;
		};
	}, [ hasMessageBatches, interactiveUiSdk, hasLoadError ] );

	// Dispose of the interactive UI runtime when the conversation session changes or the component unmounts.
	useEffect( () => {
		return () => {
			conversationSession.runtime?.dispose();
			conversationSession.runtime = undefined;
			conversationSession.processedBatchSignatures = [];
		};
	}, [ conversationSession ] );

	// Update the interactive UI runtime when new message batches arrive or the processing state changes.
	useEffect( () => {
		if ( ! interactiveUiSdk || isProcessing ) {
			return;
		}

		// Dispose of the current runtime if any of the processed batch signatures have changed.
		if (
			conversationSession.processedBatchSignatures.some(
				( signature, index ) => signature !== messageBatches[ index ]?.signature
			)
		) {
			conversationSession.runtime?.dispose();
			conversationSession.runtime = undefined;
			conversationSession.processedBatchSignatures = [];
		}

		// Create a new runtime if there are message batches and no current runtime.
		if ( messageBatches.length > 0 && ! conversationSession.runtime ) {
			conversationSession.runtime = interactiveUiSdk.createInteractiveUiRuntime(
				async ( action ) => {
					const latestInputs = actionInputsRef.current;

					if ( ! latestInputs.agentConfig || latestInputs.isProcessing ) {
						return;
					}

					await latestInputs.submitContextMessage( JSON.stringify( { version: 'v0.9', action } ), {
						type: 'context',
						sessionId: latestInputs.agentConfig.sessionId,
					} );
				}
			);
		}

		// Process any new message batches that have not been attempted yet.
		for ( const batch of messageBatches.slice(
			conversationSession.processedBatchSignatures.length
		) ) {
			try {
				conversationSession.runtime?.processMessages( batch.operations, batch.messageId );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( '[AgentsManager] Failed to process an interactive UI batch:', error );
			}
		}

		conversationSession.processedBatchSignatures = messageBatches.map(
			( batch ) => batch.signature
		);
		setRuntimeRevision( ( currentRevision ) => currentRevision + 1 );
	}, [ messageBatches, isProcessing, interactiveUiSdk, conversationSession ] );

	const presentation = useMemo< InteractiveUiPresentation >(
		() => ( {
			runtime: conversationSession.runtime,
			sdk: interactiveUiSdk,
			hasLoadError,
			retryLoad: () => setHasLoadError( false ),
			revision: runtimeRevision,
			isDisabled: isProcessing,
		} ),
		[ conversationSession.runtime, interactiveUiSdk, hasLoadError, runtimeRevision, isProcessing ]
	);

	return useMemo(
		() => attachInteractiveUiPresentation( convertedMessages, presentation ),
		[ convertedMessages, presentation ]
	);
}
