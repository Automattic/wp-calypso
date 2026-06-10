/**
 * Refine-with-AI dock for the output-detail screen: a chat layer over
 * the `refine` endpoint that page-scopes edits to a rendered one-pager.
 * Uses `AgentUI` directly (driven from local state) rather than the
 * agenttic-client stack. Thread state is ephemeral by design.
 *
 * Every instruction — typed in the input or batched from annotate mode —
 * goes through one sequential queue. A single `drain()` loop owns the whole
 * per-instruction lifecycle (submit → poll the run to a terminal status →
 * post the reply), so there is no cross-render state machine to race: the
 * only gate is a synchronous "already draining" flag.
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
import { useAgentStudioRunPoller } from '../../data/use-agent-studio-run';
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

interface BatchProgress {
	/** Page being updated; null while the refine request is still in flight. */
	page: number | null;
	/** Instructions waiting behind the current one. */
	remaining: number;
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
	const [ inputValue, setInputValue ] = useState( '' );
	const [ progress, setProgress ] = useState< BatchProgress | null >( null );
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const refine = useRefineCollateralPage();
	const pollRun = useAgentStudioRunPoller();

	// The queue and its consumer live in refs: `enqueue` is callable from any
	// render, and `drain` is the single consumer behind a synchronous gate.
	const queueRef = useRef< string[] >( [] );
	const isDrainingRef = useRef( false );
	const isUnmountedRef = useRef( false );
	useEffect(
		() => () => {
			isUnmountedRef.current = true;
		},
		[]
	);

	const postReply = ( text: string ) =>
		setMessages( ( current ) => [ ...current, agentMessage( text ) ] );

	const drain = async (): Promise< void > => {
		if ( isDrainingRef.current ) {
			return;
		}
		isDrainingRef.current = true;
		try {
			while ( ! isUnmountedRef.current ) {
				const instruction = queueRef.current.shift();
				if ( instruction === undefined ) {
					return;
				}
				setProgress( { page: null, remaining: queueRef.current.length } );
				setMessages( ( current ) => [ ...current, userMessage( instruction ) ] );
				dispatch(
					recordTracksEvent( 'calypso_a4a_agent_studio_refine_submit', {
						collateral_post_id: collateralPostId,
						instruction_length: instruction.length,
					} )
				);

				let runId: string;
				let page: number;
				try {
					const response = await refine.mutateAsync( { collateralPostId, instruction } );
					runId = String( response.run_id );
					page = response.page;
				} catch ( err: unknown ) {
					const clarification = getRefineClarificationMessage( err );
					if ( clarification ) {
						// Server asked for clarification (no run created); show it inline.
						postReply( clarification );
						dispatch(
							recordTracksEvent( 'calypso_a4a_agent_studio_refine_clarification', {
								collateral_post_id: collateralPostId,
							} )
						);
					} else {
						postReply( __( 'Something went wrong. Please try again in a moment.' ) );
						dispatch(
							recordTracksEvent( 'calypso_a4a_agent_studio_refine_error', {
								collateral_post_id: collateralPostId,
								reason: 'request_failed',
							} )
						);
					}
					continue;
				}

				setProgress( { page, remaining: queueRef.current.length } );
				const status = await pollRun( runId, () => isUnmountedRef.current );
				if ( status === null ) {
					// Unmounted mid-run: the server keeps working, but there is
					// no surface left to report to; queued edits are dropped.
					return;
				}
				if ( status === 'a4a_completed' ) {
					postReply(
						sprintf(
							/* translators: %d is the 1-based page number the user pointed at. */
							__( 'Updated page %d.' ),
							page
						)
					);
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
							run_id: runId,
							page,
							status,
						} )
					);
				} else {
					postReply( __( "I couldn't update that page. Try rephrasing your request." ) );
					dispatch(
						recordTracksEvent( 'calypso_a4a_agent_studio_refine_error', {
							run_id: runId,
							page,
							status,
						} )
					);
				}
			}
		} finally {
			isDrainingRef.current = false;
			if ( ! isUnmountedRef.current ) {
				setProgress( null );
			}
		}
	};

	const enqueue = ( instructions: string[] ) => {
		queueRef.current.push( ...instructions );
		// Keep the "N more queued" hint live when a batch lands mid-run.
		setProgress( ( current ) =>
			current ? { ...current, remaining: queueRef.current.length } : current
		);
		void drain();
	};

	const handleSubmit = ( instruction: string ): void => {
		const trimmed = instruction.trim();
		if ( trimmed === '' ) {
			return;
		}
		// Input is controlled, so clear it ourselves once the message is sent.
		setInputValue( '' );
		enqueue( [ trimmed ] );
	};

	// Enqueue each auto-submit batch exactly once, tracked by array identity
	// (the ref also covers a double effect run before the parent's clear lands).
	const enqueuedBatchRef = useRef< string[] | null >( null );
	useEffect( () => {
		if (
			autoSubmitInstructions.length === 0 ||
			enqueuedBatchRef.current === autoSubmitInstructions
		) {
			return;
		}
		enqueuedBatchRef.current = autoSubmitInstructions;
		enqueue( autoSubmitInstructions );
		onAutoSubmitConsumed();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- `enqueue` is recreated every render; the batch identity is the real trigger.
	}, [ autoSubmitInstructions, onAutoSubmitConsumed ] );

	// Plain strings — primitives compared by value, so memoizing buys nothing.
	// While the page is unknown (refine request in flight) AgentUI shows its
	// default thinking indicator; once known, surface the page and how many
	// edits still wait behind it.
	let thinkingMessage: string | undefined;
	if ( progress?.page != null && progress.remaining > 0 ) {
		thinkingMessage = sprintf(
			/* translators: %1$d is the 1-based page number being refined, %2$d is the number of edits still waiting in the queue. */
			_n(
				'Updating page %1$d… %2$d more edit queued.',
				'Updating page %1$d… %2$d more edits queued.',
				progress.remaining
			),
			progress.page,
			progress.remaining
		);
	} else if ( progress?.page != null ) {
		thinkingMessage = sprintf(
			/* translators: %d is the 1-based page number being refined. */
			__( 'Updating page %d…' ),
			progress.page
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
					isProcessing={ progress !== null }
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
