/**
 * Refine-with-AI dock for the output-detail screen: a chat layer over
 * the `refine` endpoint that page-scopes edits to a rendered one-pager.
 * Uses `AgentUI` directly (driven from local state) rather than the
 * agenttic-client stack. Thread state is ephemeral by design.
 */
import '@automattic/agenttic-ui/index.css';
import { AgentUI } from '@automattic/agenttic-ui';
import { useQueryClient } from '@tanstack/react-query';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getAgentStudioCollateralQueryKey } from '../../data/use-agent-studio-collateral';
import useAgentStudioRun, { NON_TERMINAL_RUN_STATUSES } from '../../data/use-agent-studio-run';
import { getAgentStudioVariantHtmlQueryKey } from '../../data/use-agent-studio-variant-html';
import useRefineCollateralPage, {
	getRefineClarificationMessage,
} from '../../data/use-refine-collateral-page';
import type { Message } from '@automattic/agenttic-ui/dist/types';

import './refine-with-ai-dock.scss';

interface Props {
	collateralPostId: number;
	/** Total visible pages (cover + body pages). Used in the input placeholder. */
	totalPages: number;
	/**
	 * Composed instructions (from annotate mode) submitted automatically,
	 * sequentially — the refine endpoint runs one page-scoped run at a time.
	 * Each batch is a fresh array; identity marks it as new.
	 */
	autoSubmitInstructions: string[];
	/**
	 * Called once a batch is enqueued. The parent clears the instructions so a
	 * dock remount (close + reopen) can't replay a stale batch.
	 */
	onAutoSubmitConsumed: () => void;
	onClose: () => void;
}

interface ActiveRun {
	runId: string;
	userFacingPage: number;
}

// Stable message id (agenttic-ui keys its list off `Message.id`).
// `crypto.randomUUID` when available, monotonic counter otherwise.
let messageIdCounter = 0;
const newMessageId = (): string => {
	if ( typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ) {
		return crypto.randomUUID();
	}
	messageIdCounter += 1;
	return `refine-msg-${ Date.now() }-${ messageIdCounter }`;
};

const makeMessage = ( role: 'user' | 'agent', text: string ): Message => ( {
	id: newMessageId(),
	role,
	content: [ { type: 'text', text } ],
	timestamp: Date.now(),
	archived: false,
	// The agent's replies carry the assistant avatar; the user's don't.
	showIcon: role === 'agent',
} );

const userMessage = ( text: string ): Message => makeMessage( 'user', text );
const agentMessage = ( text: string ): Message => makeMessage( 'agent', text );

export default function RefineWithAiDock( {
	collateralPostId,
	totalPages,
	autoSubmitInstructions,
	onAutoSubmitConsumed,
	onClose,
}: Props ) {
	const [ messages, setMessages ] = useState< Message[] >( [] );
	const [ activeRun, setActiveRun ] = useState< ActiveRun | null >( null );
	const [ inputValue, setInputValue ] = useState( '' );
	const [ queuedInstructions, setQueuedInstructions ] = useState< string[] >( [] );
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const refine = useRefineCollateralPage();

	// `useAgentStudioRun` self-polls while non-terminal; undefined keeps it idle.
	const run = useAgentStudioRun( activeRun?.runId );

	// Synchronous in-flight gate for the queue drain. State guards alone are
	// unreliable here: react-query's `isPending` notification can render via
	// `useSyncExternalStore` before the batched `setActiveRun` flushes, opening
	// a window where both look idle and the drain double-fires (observed:
	// the first run got orphaned mid-batch). True from submission until the
	// run settles (completion effect below) or the request fails.
	const inFlightRef = useRef( false );

	// Post the success/failure reply once per run, not on every poll re-render.
	const handledRunIdRef = useRef< string | null >( null );
	useEffect( () => {
		if ( ! activeRun || ! run.data ) {
			return;
		}
		// Settled once the run leaves the non-terminal set — same signal the
		// hook uses to stop polling.
		const status = run.data.status;
		if ( NON_TERMINAL_RUN_STATUSES.has( status ) ) {
			return;
		}
		if ( handledRunIdRef.current === activeRun.runId ) {
			return;
		}
		handledRunIdRef.current = activeRun.runId;

		if ( status === 'a4a_completed' ) {
			setMessages( ( current ) => [
				...current,
				agentMessage(
					sprintf(
						/* translators: %d is the 1-based page number the user pointed at. */
						__( 'Updated page %d.' ),
						activeRun.userFacingPage
					)
				),
			] );
			// Refresh the preview: invalidate the variant-html and collateral
			// queries by prefix (refine may also bump html_url on the collateral).
			void queryClient.invalidateQueries( {
				queryKey: getAgentStudioVariantHtmlQueryKey( undefined ).slice( 0, 1 ),
			} );
			void queryClient.invalidateQueries( {
				queryKey: getAgentStudioCollateralQueryKey( undefined, undefined ).slice( 0, 1 ),
			} );
			dispatch(
				recordTracksEvent( 'calypso_a4a_agent_studio_refine_complete', {
					run_id: activeRun.runId,
					page: activeRun.userFacingPage,
					status,
				} )
			);
		} else {
			setMessages( ( current ) => [
				...current,
				agentMessage( __( "I couldn't update that page. Try rephrasing your request." ) ),
			] );
			dispatch(
				recordTracksEvent( 'calypso_a4a_agent_studio_refine_error', {
					run_id: activeRun.runId,
					page: activeRun.userFacingPage,
					status,
				} )
			);
		}
		setActiveRun( null );
		inFlightRef.current = false;
	}, [ activeRun, run.data, queryClient, dispatch ] );

	const submitInstruction = async ( instruction: string ): Promise< void > => {
		inFlightRef.current = true;
		setMessages( ( current ) => [ ...current, userMessage( instruction ) ] );
		dispatch(
			recordTracksEvent( 'calypso_a4a_agent_studio_refine_submit', {
				collateral_post_id: collateralPostId,
				instruction_length: instruction.length,
			} )
		);

		try {
			const response = await refine.mutateAsync( {
				collateralPostId,
				instruction,
			} );
			setActiveRun( {
				runId: String( response.run_id ),
				userFacingPage: response.page,
			} );
		} catch ( err: unknown ) {
			// No run was created, so the gate lifts here rather than in the
			// completion effect.
			inFlightRef.current = false;
			const clarification = getRefineClarificationMessage( err );
			if ( clarification ) {
				// Server asked for clarification (no run created); show it inline.
				setMessages( ( current ) => [ ...current, agentMessage( clarification ) ] );
				dispatch(
					recordTracksEvent( 'calypso_a4a_agent_studio_refine_clarification', {
						collateral_post_id: collateralPostId,
					} )
				);
				return;
			}
			setMessages( ( current ) => [
				...current,
				agentMessage( __( 'Something went wrong. Please try again in a moment.' ) ),
			] );
			dispatch(
				recordTracksEvent( 'calypso_a4a_agent_studio_refine_error', {
					collateral_post_id: collateralPostId,
					reason: 'request_failed',
				} )
			);
		}
	};

	const handleSubmit = async ( instruction: string ): Promise< void > => {
		const trimmed = instruction.trim();
		if ( '' === trimmed || activeRun || inFlightRef.current ) {
			return;
		}
		// Input is controlled, so clear it ourselves once the message is sent.
		setInputValue( '' );
		await submitInstruction( trimmed );
	};

	// Enqueue each new auto-submit batch exactly once, tracked by array
	// identity (the ref also covers a double effect run before the parent's
	// clear lands).
	const enqueuedBatchRef = useRef< string[] | null >( null );
	useEffect( () => {
		if (
			autoSubmitInstructions.length === 0 ||
			enqueuedBatchRef.current === autoSubmitInstructions
		) {
			return;
		}
		enqueuedBatchRef.current = autoSubmitInstructions;
		setQueuedInstructions( ( current ) => [ ...current, ...autoSubmitInstructions ] );
		onAutoSubmitConsumed();
	}, [ autoSubmitInstructions, onAutoSubmitConsumed ] );

	// Drain the queue one instruction at a time: each run must settle (the
	// completion effect above clears `activeRun`) before the next page's
	// instruction goes out.
	useEffect( () => {
		if ( queuedInstructions.length === 0 || inFlightRef.current || activeRun || refine.isPending ) {
			return;
		}
		const [ head, ...rest ] = queuedInstructions;
		setQueuedInstructions( rest );
		void submitInstruction( head );
		// eslint-disable-next-line react-hooks/exhaustive-deps -- `submitInstruction` is recreated every render; the queue, run, and pending flags are the real triggers.
	}, [ queuedInstructions, activeRun, refine.isPending ] );

	const isProcessing = activeRun !== null || refine.isPending || queuedInstructions.length > 0;

	// Plain strings — primitives compared by value, so memoizing buys nothing.
	// With a batch in flight (annotate mode), surface how many edits still wait
	// behind the active run so the user knows the work isn't done yet.
	const queuedCount = queuedInstructions.length;
	let thinkingMessage: string | undefined;
	if ( activeRun && queuedCount > 0 ) {
		thinkingMessage = sprintf(
			/* translators: %1$d is the 1-based page number being refined, %2$d is the number of edits still waiting in the queue. */
			_n(
				'Updating page %1$d… %2$d more edit queued.',
				'Updating page %1$d… %2$d more edits queued.',
				queuedCount
			),
			activeRun.userFacingPage,
			queuedCount
		);
	} else if ( activeRun ) {
		thinkingMessage = sprintf(
			/* translators: %d is the 1-based page number being refined. */
			__( 'Updating page %d…' ),
			activeRun.userFacingPage
		);
	}

	// totalPages includes the cover; the lowest refinable page is 2.
	const placeholderHint = sprintf(
		/* translators: %d is the highest body page number, 1-based with cover. */
		__( 'Tell me what to change. e.g. "page %d is clipped".' ),
		Math.max( 2, totalPages )
	);

	return (
		<aside className="a4a-refine-with-ai-dock" aria-label={ __( 'Refine with AI' ) }>
			<HStack className="a4a-refine-with-ai-dock__header" justify="space-between" spacing={ 2 }>
				<strong>{ __( 'Refine with AI' ) }</strong>
				<Button
					icon={ close }
					label={ __( 'Close refine panel' ) }
					onClick={ onClose }
					size="small"
				/>
			</HStack>
			<div className="a4a-refine-with-ai-dock__body">
				<AgentUI
					variant="embedded"
					messages={ messages }
					isProcessing={ isProcessing }
					thinkingMessage={ thinkingMessage }
					placeholder={ placeholderHint }
					inputValue={ inputValue }
					onInputChange={ setInputValue }
					onSubmit={ handleSubmit }
				/>
			</div>
		</aside>
	);
}
