import { useEffect, useLayoutEffect, useMemo, useRef, useState } from '@wordpress/element';
import { useAgentsManagerContext } from '../contexts';
import { getLatestUserMessageIndex } from '../utils/latest-message';
import { createInteractiveUiCatalogs } from './catalogs';
import {
	attachInteractiveUiPresentation,
	markInteractiveUiActionReplies,
} from './convert-messages-to-components';
import {
	applyInteractiveUiBatch,
	getInteractiveUiBatches,
	getStaleInteractiveUiSurfaceIds,
	INTERACTIVE_UI_VERSION,
} from './messages';
import {
	disposeInteractiveUiRuntime,
	getInteractiveUiSession,
	trackInteractiveUiHistory,
} from './session';
import type { InteractiveUiRenderer } from './catalogs';
import type { InteractiveUiSession } from './session';
import type { AgentsManagerUIMessage } from '../utils/convert-tool-messages-to-components';
import type { LoadedProviders } from '../utils/load-external-providers';
import type { UIMessage, SubmitOptions } from '@automattic/agenttic-client';
import type { InteractiveUiRuntime } from '@automattic/ai-ui-renderer';

interface UseInteractiveUiOptions {
	convertedMessages: AgentsManagerUIMessage[];
	messages: UIMessage[];
	/** The site, user and agent the conversation belongs to. */
	scopeIdentity: string;
	sessionId: string;
	/** The agent is replying. */
	isProcessing: boolean;
	isUploadingImages: boolean;
	submitContextMessage: ( message: string, options: SubmitOptions ) => Promise< void >;
	/** The providers' interactive UI catalogs. */
	interactiveUiCatalogs: LoadedProviders[ 'interactiveUiCatalogs' ];
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

// Kept for the page, so a remounted chat, such as after the history screen, has it right away.
let loadedRenderer: InteractiveUiRenderer | undefined;

/**
 * Runs the interactive UI surfaces in agent replies and returns the transcript with them
 * attached. Loads the renderer once a reply has a surface, applies the surfaces once the reply has
 * streamed, rebuilds them when an earlier reply changes, and sends their actions to the agent as
 * hidden context messages. Marks surfaces stale as `show-component` does, restored ones included,
 * offers a retry when the renderer fails to load, and starts a new turn at each reply to an
 * action, since the action's message is hidden.
 */
export function useInteractiveUi( {
	messages,
	convertedMessages,
	scopeIdentity,
	sessionId,
	isProcessing,
	isUploadingImages,
	submitContextMessage,
	interactiveUiCatalogs,
	currentPostId,
}: UseInteractiveUiOptions ) {
	const { agentConfig } = useAgentsManagerContext();

	// The transcript's surfaces, which wait while the agent replies or images upload.
	const messageBatches = useMemo( () => getInteractiveUiBatches( messages ), [ messages ] );
	const hasMessageBatches = messageBatches.length > 0;
	const latestUserMessageIndex = getLatestUserMessageIndex( messages );
	const isBusy = isProcessing || isUploadingImages;

	// The latest inputs, for actions from a runtime created on an earlier render.
	const actionInputsRef = useRef( { agentConfig, isBusy, submitContextMessage } );
	actionInputsRef.current = { agentConfig, isBusy, submitContextMessage };

	// The conversation's session, and which of its surfaces come from history.
	const sessionRef = useRef< InteractiveUiSession | undefined >( undefined );
	sessionRef.current = getInteractiveUiSession( sessionRef.current, scopeIdentity, sessionId );
	const conversationSession = sessionRef.current;

	// Before the batches apply, so restored surfaces are stale from their first paint.
	useLayoutEffect( () => {
		trackInteractiveUiHistory( conversationSession.history, {
			isProcessing,
			batches: messageBatches,
		} );
	}, [ conversationSession, isProcessing, messageBatches ] );

	// The renderer, loaded on demand to keep it out of the initial bundle. A retry starts a new
	// attempt while the error stays on screen, so the retry button can show it's busy.
	const [ renderer, setRenderer ] = useState( () => loadedRenderer );
	const [ loadAttempt, setLoadAttempt ] = useState( 0 );
	const [ failedLoadAttempt, setFailedLoadAttempt ] = useState< number >();

	useEffect( () => {
		if ( ! hasMessageBatches || renderer ) {
			return;
		}

		let isLoadCancelled = false;

		void import( /* webpackChunkName: "am-interactive-ui" */ '@automattic/ai-ui-renderer' ).then(
			( rendererModule ) => {
				loadedRenderer = rendererModule;

				if ( ! isLoadCancelled ) {
					setRenderer( rendererModule );
				}
			},
			() => ! isLoadCancelled && setFailedLoadAttempt( loadAttempt )
		);

		return () => {
			isLoadCancelled = true;
		};
	}, [ hasMessageBatches, renderer, loadAttempt ] );

	const hasLoadError = ! renderer && failedLoadAttempt !== undefined;
	const isRetryingLoad = hasLoadError && failedLoadAttempt < loadAttempt;

	const catalogs = useMemo(
		() => renderer && createInteractiveUiCatalogs( renderer, interactiveUiCatalogs ),
		[ renderer, interactiveUiCatalogs ]
	);

	// The runtime, disposed of when the conversation changes or the chat unmounts.
	const [ runtimeRevision, setRuntimeRevision ] = useState( 0 );

	useEffect(
		() => () => disposeInteractiveUiRuntime( conversationSession ),
		[ conversationSession ]
	);

	// Applies new batches once the reply has streamed, so a surface never changes mid-stream, and
	// before paint, so a surface-only reply, such as a picker, doesn't pop in later and shift the
	// chat.
	useLayoutEffect( () => {
		if ( ! renderer || ! catalogs || isBusy ) {
			return;
		}

		// Start over when an earlier batch changed.
		const hasChangedBatches = conversationSession.appliedBatches.some(
			( batch, index ) => batch.signature !== messageBatches[ index ]?.signature
		);

		if ( hasChangedBatches ) {
			disposeInteractiveUiRuntime( conversationSession );
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

					if ( ! latestInputs.agentConfig || latestInputs.isBusy ) {
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
	}, [ messageBatches, isBusy, renderer, catalogs, conversationSession ] );

	// Follows the batches the runtime has applied, not one still streaming, so a surface never
	// changes staleness before its data does.
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

	// The transcript with its surfaces attached.
	const presentation = useMemo< InteractiveUiPresentation >(
		() => ( {
			runtime: conversationSession.runtime,
			renderer,
			hasLoadError,
			isRetryingLoad,
			retryLoad: () => setLoadAttempt( ( attempt ) => attempt + 1 ),
			revision: runtimeRevision,
			isDisabled: isBusy,
			staleSurfaceIds,
		} ),
		[
			conversationSession.runtime,
			renderer,
			hasLoadError,
			isRetryingLoad,
			runtimeRevision,
			isBusy,
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
