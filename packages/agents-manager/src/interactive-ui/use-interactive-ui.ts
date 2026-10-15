import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { startNewUserRequest } from '../utils/canvas-binding';
import { startTurn } from '../utils/turn-id';
import { executeInteractiveUiAction } from './execute-interactive-ui-action';
import { getInteractiveUiBatches } from './interactive-ui-messages';
import type { InteractiveUiRuntime } from './runtime';
import type { AgentConfig } from '../utils/create-agent-config';
import type { UIMessage, UseAgentChatReturn } from '@automattic/agenttic-client';

interface Options {
	messages: UIMessage[];
	conversationId: string;
	isProcessing: boolean;
	agentConfig: AgentConfig | null;
	onSubmit: UseAgentChatReturn[ 'onSubmit' ];
	beforeSubmit: () => boolean;
	flushPendingNavigation: () => Promise< void >;
}

/**
 * Updates the interactive UI after the agent finishes responding. Keeps the user's
 * input when new messages arrive, and rebuilds the UI if earlier messages change.
 * Sends UI actions back to the agent without showing them as chat messages.
 * Reports SDK loading failures so forms can offer a retry.
 */
export default function useInteractiveUi( options: Options ) {
	const latestOptionsRef = useRef( options );
	latestOptionsRef.current = options;

	const [ interactiveUiSdk, setInteractiveUiSdk ] = useState< typeof import( '.' ) >();
	const [ hasLoadError, setHasLoadError ] = useState( false );
	const [ runtimeRevision, setRuntimeRevision ] = useState( 0 );

	const messageBatches = useMemo(
		() => getInteractiveUiBatches( options.messages ),
		[ options.messages ]
	);
	const hasMessageBatches = messageBatches.length > 0;

	const conversationSession = useMemo(
		() => ( {
			conversationId: options.conversationId,
			runtime: undefined as InteractiveUiRuntime | undefined,
			processedBatchSignatures: [] as string[],
		} ),
		[ options.conversationId ]
	);

	// Load the interactive UI SDK dynamically to reduce the initial bundle size.
	useEffect( () => {
		if ( ! hasMessageBatches || interactiveUiSdk || hasLoadError ) {
			return;
		}

		let isUiLoadCancelled = false;
		void import( /* webpackChunkName: "am-interactive-ui" */ '.' ).then(
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
		if ( ! interactiveUiSdk || options.isProcessing ) {
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
					const { agentConfig, isProcessing, onSubmit, beforeSubmit, flushPendingNavigation } =
						latestOptionsRef.current;

					if ( ! agentConfig || isProcessing || ! beforeSubmit() ) {
						return;
					}

					startTurn();
					startNewUserRequest();
					await flushPendingNavigation();
					await executeInteractiveUiAction( action, agentConfig, onSubmit );
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
	}, [ messageBatches, options.isProcessing, interactiveUiSdk, conversationSession ] );

	return useMemo(
		() => ( {
			runtime: conversationSession.runtime,
			sdk: interactiveUiSdk,
			hasLoadError,
			retryLoad: () => setHasLoadError( false ),
			revision: runtimeRevision,
			isDisabled: options.isProcessing,
		} ),
		[
			conversationSession.runtime,
			interactiveUiSdk,
			hasLoadError,
			runtimeRevision,
			options.isProcessing,
		]
	);
}

export type InteractiveUiPresentation = ReturnType< typeof useInteractiveUi >;
