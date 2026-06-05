/**
 * Refine-with-AI dock for the output-detail screen: a chat layer over
 * the `refine` endpoint that page-scopes edits to a rendered one-pager.
 * Uses `AgentUI` directly (driven from local state) rather than the
 * agenttic-client stack. Thread state is ephemeral by design.
 */
import '@automattic/agenttic-ui/index.css';
import { AgentUI } from '@automattic/agenttic-ui';
import { useQueryClient } from '@tanstack/react-query';
import {
	Button,
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { close, comment } from '@wordpress/icons';
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
	/** Total visible pages (cover + body pages). Used in the empty-state hint. */
	totalPages: number;
	/** Text to seed the input with (empty opens an empty input). */
	seedText: string;
	/**
	 * Bumped on every open request. The per-page "Edit with AI" button can be
	 * re-clicked while the dock is already open — and after a submit clears the
	 * input — so re-seeding the same `seedText` must still fire. The token is
	 * the trigger; `seedText` alone wouldn't change.
	 */
	seedToken: number;
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
	seedText,
	seedToken,
	onClose,
}: Props ) {
	const [ messages, setMessages ] = useState< Message[] >( [] );
	const [ activeRun, setActiveRun ] = useState< ActiveRun | null >( null );
	const [ inputValue, setInputValue ] = useState( '' );
	const rootRef = useRef< HTMLElement >( null );
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const refine = useRefineCollateralPage();

	// Seed the input on each open request (tracked by `seedToken`), then move
	// the caret to the end of AgentUI's internal textarea. `seedText` is left
	// out of the deps so re-clicking the same page's Edit button re-seeds.
	useEffect( () => {
		setInputValue( seedText );
		const raf = requestAnimationFrame( () => {
			const textarea = rootRef.current?.querySelector( 'textarea' );
			if ( textarea ) {
				textarea.focus();
				const end = textarea.value.length;
				textarea.setSelectionRange( end, end );
			}
		} );
		return () => cancelAnimationFrame( raf );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ seedToken ] );

	// `useAgentStudioRun` self-polls while non-terminal; undefined keeps it idle.
	const run = useAgentStudioRun( activeRun?.runId );

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
	}, [ activeRun, run.data, queryClient, dispatch ] );

	const handleSubmit = async ( instruction: string ): Promise< void > => {
		const trimmed = instruction.trim();
		if ( '' === trimmed || activeRun ) {
			return;
		}
		// Input is controlled, so clear it ourselves once the message is sent.
		setInputValue( '' );
		setMessages( ( current ) => [ ...current, userMessage( trimmed ) ] );
		dispatch(
			recordTracksEvent( 'calypso_a4a_agent_studio_refine_submit', {
				collateral_post_id: collateralPostId,
				instruction_length: trimmed.length,
			} )
		);

		try {
			const response = await refine.mutateAsync( {
				collateralPostId,
				instruction: trimmed,
			} );
			setActiveRun( {
				runId: String( response.run_id ),
				userFacingPage: response.page,
			} );
		} catch ( err: unknown ) {
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

	const isProcessing = activeRun !== null || refine.isPending;

	// Plain strings — primitives compared by value, so memoizing buys nothing.
	const thinkingMessage = activeRun
		? sprintf(
				/* translators: %d is the 1-based page number being refined. */
				__( 'Updating page %d…' ),
				activeRun.userFacingPage
		  )
		: undefined;

	// totalPages includes the cover; the lowest refinable page is 2.
	const placeholderHint = sprintf(
		/* translators: %d is the highest body page number, 1-based with cover. */
		__( 'Tell me what to change. e.g. "page %d is clipped".' ),
		Math.max( 2, totalPages )
	);

	const emptyView = (
		<VStack className="a4a-refine-with-ai-dock__empty" spacing={ 3 } alignment="center">
			<Icon className="a4a-refine-with-ai-dock__empty-icon" icon={ comment } size={ 28 } />
			<Text as="p" weight={ 500 } align="center">
				{ __( 'Refine your one-pager' ) }
			</Text>
			<Text as="p" variant="muted" align="center" className="a4a-refine-with-ai-dock__empty-hint">
				{ __(
					'Point me at a page and tell me what to fix, like “page 3 is clipped” or “tighten the intro”. I’ll update that page in place and refresh the preview.'
				) }
			</Text>
		</VStack>
	);

	return (
		<aside
			ref={ rootRef }
			className="a4a-refine-with-ai-dock"
			aria-label={ __( 'Refine with AI' ) }
		>
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
					emptyView={ emptyView }
					inputValue={ inputValue }
					onInputChange={ setInputValue }
					onSubmit={ handleSubmit }
				/>
			</div>
		</aside>
	);
}
