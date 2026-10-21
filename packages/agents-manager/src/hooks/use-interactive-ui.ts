import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import {
	attachInteractiveUiPresentation,
	markInteractiveUiActionReplies,
} from '../utils/convert-interactive-ui-messages-to-components';
import { createInteractiveUiCatalogs } from '../utils/interactive-ui-catalogs';
import {
	applyInteractiveUiBatch,
	getInteractiveUiBatches,
	getStaleInteractiveUiSurfaceIds,
	INTERACTIVE_UI_VERSION,
} from '../utils/interactive-ui-messages';
import {
	getInteractiveUiSession,
	trackInteractiveUiHistory,
} from '../utils/interactive-ui-session';
import { getLatestUserMessageIndex } from '../utils/latest-message';
import type { AgentsManagerUIMessage } from '../utils/convert-tool-messages-to-components';
import type { AgentConfig } from '../utils/create-agent-config';
import type { InteractiveUiRenderer } from '../utils/interactive-ui-catalogs';
import type { InteractiveUiSession } from '../utils/interactive-ui-session';
import type { LoadedProviders } from '../utils/load-external-providers';
import type { UIMessage, SubmitOptions } from '@automattic/agenttic-client';
import type { InteractiveUiRuntime } from '@automattic/ai-ui-renderer';

interface UseInteractiveUiOptions {
	convertedMessages: AgentsManagerUIMessage[];
	messages: UIMessage[];
	/** The site, user and agent the conversation belongs to. */
	scopeIdentity: string;
	sessionId: string;
	isProcessing: boolean;
	agentConfig: AgentConfig | null;
	submitContextMessage: ( message: string, options: SubmitOptions ) => Promise< void >;
	/** The providers' interactive UI components and functions. */
	interactiveUi: LoadedProviders[ 'interactiveUi' ];
	/** The page the editor has open, if any. */
	currentPostId?: number | string;
}

export interface InteractiveUiPresentation {
	runtime: InteractiveUiRuntime | undefined;
	renderer: InteractiveUiRenderer | undefined;
	hasLoadError: boolean;
	isRetryingLoad: boolean;
	retryLoad: () => void;
	revision: number;
	isDisabled: boolean;
	staleSurfaceIds: ReadonlySet< string >;
}

/**
 * Runs the interactive UI surfaces in agent replies and returns the transcript with them
 * attached. Loads the renderer once a reply has a surface, applies surfaces after the reply
 * has streamed so none changes mid-stream, and sends their actions to the agent as hidden
 * context messages. Keeps the user's input as messages arrive, rebuilds the surfaces when
 * an earlier reply changes, and reports a failed load so the chat can offer a retry. Marks
 * surfaces stale as `show-component` does, restored ones included, and starts a new turn at each
 * reply to an action, since the action's message is hidden.
 */
export function useInteractiveUi( {
	messages,
	convertedMessages,
	scopeIdentity,
	sessionId,
	isProcessing,
	agentConfig,
	submitContextMessage,
	interactiveUi,
	currentPostId,
}: UseInteractiveUiOptions ) {
	const messageBatches = useMemo( () => getInteractiveUiBatches( messages ), [ messages ] );
	const hasMessageBatches = messageBatches.length > 0;

	const latestUserMessageIndex = getLatestUserMessageIndex( messages );

	const actionInputsRef = useRef( { agentConfig, isProcessing, submitContextMessage } );
	actionInputsRef.current = { agentConfig, isProcessing, submitContextMessage };

	const [ renderer, setRenderer ] = useState< InteractiveUiRenderer >();
	const [ loadAttempt, setLoadAttempt ] = useState( 0 );
	const [ failedLoadAttempt, setFailedLoadAttempt ] = useState< number >();
	const [ runtimeRevision, setRuntimeRevision ] = useState( 0 );

	const sessionRef = useRef< InteractiveUiSession | undefined >( undefined );
	sessionRef.current = getInteractiveUiSession( sessionRef.current, scopeIdentity, sessionId );
	const conversationSession = sessionRef.current;

	useEffect( () => {
		trackInteractiveUiHistory( conversationSession.history, {
			isProcessing,
			messageCount: messages.length,
			batches: messageBatches,
		} );
	}, [ conversationSession, isProcessing, messages.length, messageBatches ] );

	// Staleness follows the batches the runtime has applied, not one still streaming, so a surface
	// never changes staleness before its data does.
	const staleSurfaceIds = useMemo(
		() =>
			getStaleInteractiveUiSurfaceIds( conversationSession.appliedBatches, {
				latestUserMessageIndex,
				restoredSignatures: conversationSession.history.restoredSignatures,
				currentPostId,
			} ),
		[
			conversationSession.appliedBatches,
			conversationSession.history.restoredSignatures,
			latestUserMessageIndex,
			currentPostId,
		]
	);

	// Load the renderer on demand to keep it out of the initial bundle. A retry starts a new
	// attempt while the error stays on screen, so the retry button can show it's busy.
	useEffect( () => {
		if ( ! hasMessageBatches || renderer ) {
			return;
		}

		let isLoadCancelled = false;

		void import( /* webpackChunkName: "am-interactive-ui" */ '@automattic/ai-ui-renderer' ).then(
			( rendererModule ) => ! isLoadCancelled && setRenderer( rendererModule ),
			() => ! isLoadCancelled && setFailedLoadAttempt( loadAttempt )
		);

		return () => {
			isLoadCancelled = true;
		};
	}, [ hasMessageBatches, renderer, loadAttempt ] );

	const hasLoadError = ! renderer && failedLoadAttempt !== undefined;
	const isRetryingLoad = hasLoadError && failedLoadAttempt < loadAttempt;

	const catalogs = useMemo(
		() => renderer && createInteractiveUiCatalogs( renderer, interactiveUi ),
		[ renderer, interactiveUi ]
	);

	// Dispose of the runtime when the conversation changes or the chat unmounts.
	useEffect( () => {
		return () => {
			conversationSession.runtime?.dispose();
			conversationSession.runtime = undefined;
			conversationSession.appliedBatches = [];
		};
	}, [ conversationSession ] );

	// Apply new batches once the reply has streamed, so a surface never changes mid-stream.
	useEffect( () => {
		if ( ! renderer || ! catalogs || isProcessing ) {
			return;
		}

		// Start over when an earlier batch changed.
		const hasChangedBatches = conversationSession.appliedBatches.some(
			( batch, index ) => batch.signature !== messageBatches[ index ]?.signature
		);

		if ( hasChangedBatches ) {
			conversationSession.runtime?.dispose();
			conversationSession.runtime = undefined;
			conversationSession.appliedBatches = [];
		}

		const newBatches = messageBatches.slice( conversationSession.appliedBatches.length );
		if ( ! hasChangedBatches && newBatches.length === 0 ) {
			return;
		}

		if ( newBatches.length > 0 && ! conversationSession.runtime ) {
			conversationSession.runtime = renderer.createInteractiveUiRuntime( {
				catalogs,
				onAction: async ( action ) => {
					const latestInputs = actionInputsRef.current;

					if ( ! latestInputs.agentConfig || latestInputs.isProcessing ) {
						return;
					}

					const actionMessage = JSON.stringify( { version: INTERACTIVE_UI_VERSION, action } );

					await latestInputs.submitContextMessage( actionMessage, {
						type: 'context',
						sessionId: latestInputs.agentConfig.sessionId,
					} );
				},
				onError: ( error ) => {
					// eslint-disable-next-line no-console
					console.error( '[AgentsManager] Interactive UI error:', error );
				},
			} );
		}

		const { runtime } = conversationSession;
		if ( runtime ) {
			conversationSession.appliedBatches = [
				...conversationSession.appliedBatches,
				...newBatches.map( ( batch ) => applyInteractiveUiBatch( runtime, batch ) ),
			];
		}

		setRuntimeRevision( ( currentRevision ) => currentRevision + 1 );
	}, [ messageBatches, isProcessing, renderer, catalogs, conversationSession ] );

	const presentation = useMemo< InteractiveUiPresentation >(
		() => ( {
			runtime: conversationSession.runtime,
			renderer,
			hasLoadError,
			isRetryingLoad,
			retryLoad: () => setLoadAttempt( ( attempt ) => attempt + 1 ),
			revision: runtimeRevision,
			isDisabled: isProcessing,
			staleSurfaceIds,
		} ),
		[
			conversationSession.runtime,
			renderer,
			hasLoadError,
			isRetryingLoad,
			runtimeRevision,
			isProcessing,
			staleSurfaceIds,
		]
	);

	return useMemo(
		() =>
			markInteractiveUiActionReplies(
				attachInteractiveUiPresentation( convertedMessages, presentation ),
				messages
			),
		[ convertedMessages, presentation, messages ]
	);
}
