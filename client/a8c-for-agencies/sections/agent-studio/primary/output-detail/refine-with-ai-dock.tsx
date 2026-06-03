/**
 * Refine-with-AI dock attached to the output-detail screen.
 *
 * Conversational refinement layer over the existing
 * `compose-one-pager-ela-v2` pipeline. The user looks at a rendered
 * one-pager, opens this dock, and says something like "page 5 is
 * clipped". The wpcom endpoint
 * `/agency/<id>/a4a/collaterals/<post_id>/refine` parses the page
 * number out of the instruction, validates it, and dispatches the
 * `refine-one-pager-ela-v2` recipe. We poll the run and re-render
 * the preview iframe on completion.
 *
 * The chat surface is `AgentUI` from `@automattic/agenttic-ui` — the
 * framework-agnostic pure-UI primitive that `AgentChat` wraps. We
 * use it directly so we can drive everything from local React state
 * without dragging in `AGENTS_MANAGER_STORE`, `AgentsManagerContext`,
 * `agenttic-client`'s agent registry, or React Router.
 *
 * Thread state is ephemeral by design — closing the dock or
 * refreshing the page resets the transcript. The collateral itself
 * persists with the latest body_pages; the conversation about it
 * doesn't. See `~/Projects/wpcom-specs/one-pager-refinement-chat/`.
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
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { close, comment } from '@wordpress/icons';
import { getAgentStudioCollateralQueryKey } from '../../data/use-agent-studio-collateral';
import useAgentStudioRun from '../../data/use-agent-studio-run';
import { getAgentStudioVariantHtmlQueryKey } from '../../data/use-agent-studio-variant-html';
import useRefineCollateralPage, {
	isRefineClarification,
} from '../../data/use-refine-collateral-page';
import type { Message } from '@automattic/agenttic-ui/dist/types';

import './refine-with-ai-dock.scss';

interface Props {
	collateralPostId: number;
	/** Total visible pages (cover + body pages). Used in the empty-state hint. */
	totalPages: number;
	/**
	 * Text to seed the input with — set when the user opens the dock from a
	 * page-scoped "Edit this page" affordance (e.g. "On page 3, make the
	 * following edits: "). Empty string opens an empty input.
	 */
	seedText: string;
	/**
	 * Bumped every time a seed is requested. Re-seeding with the same text
	 * (clicking the same page's Edit button twice) still needs to re-focus
	 * and reset the input, which an identical `seedText` alone wouldn't
	 * trigger.
	 */
	seedToken: number;
	onClose: () => void;
}

interface ActiveRun {
	runId: string;
	userFacingPage: number;
}

/**
 * Stable message id factory — `crypto.randomUUID` when available,
 * monotonic counter fallback for older environments. agenttic-ui keys
 * its list off `Message.id`, so collisions cause React reconciliation
 * bugs in long threads.
 */
let messageIdCounter = 0;
const newMessageId = (): string => {
	if ( typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ) {
		return crypto.randomUUID();
	}
	messageIdCounter += 1;
	return `refine-msg-${ Date.now() }-${ messageIdCounter }`;
};

const userMessage = ( text: string ): Message => ( {
	id: newMessageId(),
	role: 'user',
	content: [ { type: 'text', text } ],
	timestamp: Date.now(),
	archived: false,
	showIcon: false,
} );

const agentMessage = ( text: string ): Message => ( {
	id: newMessageId(),
	role: 'agent',
	content: [ { type: 'text', text } ],
	timestamp: Date.now(),
	archived: false,
	showIcon: true,
} );

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
	const queryClient = useQueryClient();
	const refine = useRefineCollateralPage();

	// Seed the input when the dock opens from a page-scoped affordance, and
	// re-seed when a new request comes in (tracked by `seedToken`). AgentUI's
	// textarea is internal, so we reach it through the dock root to move the
	// caret to the end after filling — the user picks up typing right where
	// the prompt leaves off. `seedText` is intentionally excluded from the
	// deps: the token is the trigger, so re-clicking the same page re-seeds.
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

	// Poll the active refine run. `useAgentStudioRun` is the existing
	// runs poll hook; passing undefined keeps it idle.
	const run = useAgentStudioRun( activeRun?.runId );

	// React-Query polls on a default interval when `refetchInterval` is
	// set. The runs hook doesn't set one — opt in here while a run is
	// in-flight, then turn it off on terminal status. `run.refetch` is
	// stable across renders in react-query v5; depending only on
	// `activeRun` keeps the interval from restarting every render.
	const refetch = run.refetch;
	useEffect( () => {
		if ( ! activeRun ) {
			return;
		}
		const interval = setInterval( () => {
			void refetch();
		}, 2000 );
		return () => clearInterval( interval );
	}, [ activeRun, refetch ] );

	// Track terminal transitions so we only post the success/failure
	// message once per run. Without this the polling-driven re-render
	// would repeatedly append the same "Updated page N." reply.
	const handledRunIdRef = useRef< string | null >( null );
	useEffect( () => {
		if ( ! activeRun || ! run.data ) {
			return;
		}
		const status = run.data.status;
		const isTerminal =
			status === 'a4a_completed' || status === 'a4a_failed' || status === 'a4a_cancelled';
		if ( ! isTerminal ) {
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
			// Refresh the rendered preview. Two caches sit between us
			// and the new HTML:
			//   1. The variant-html query (keyed on html_url). Invalidate
			//      by prefix so every variant's entry refetches; the
			//      fetch itself uses `cache: 'no-cache'` to bypass the
			//      browser's HTTP cache for the same URL.
			//   2. The collateral query (keyed on agencyId + postId).
			//      Refine may bump variant.html_url to a new versioned
			//      path; without invalidating the collateral we'd keep
			//      rendering the pre-refine URL.
			void queryClient.invalidateQueries( {
				queryKey: getAgentStudioVariantHtmlQueryKey( undefined ).slice( 0, 1 ),
			} );
			void queryClient.invalidateQueries( {
				queryKey: getAgentStudioCollateralQueryKey( undefined, undefined ).slice( 0, 1 ),
			} );
		} else {
			setMessages( ( current ) => [
				...current,
				agentMessage( __( "I couldn't update that page. Try rephrasing your request." ) ),
			] );
		}
		setActiveRun( null );
	}, [ activeRun, run.data, queryClient ] );

	const handleSubmit = async ( instruction: string ): Promise< void > => {
		const trimmed = instruction.trim();
		if ( '' === trimmed || activeRun ) {
			return;
		}
		// Input is controlled, so clear it ourselves once the message is sent.
		setInputValue( '' );
		setMessages( ( current ) => [ ...current, userMessage( trimmed ) ] );

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
			if ( isRefineClarification( err ) ) {
				// Server told us what to ask for. Render the message as
				// an assistant reply; user retries with a clearer
				// instruction. No run was created.
				setMessages( ( current ) => [ ...current, agentMessage( err.message ) ] );
				return;
			}
			setMessages( ( current ) => [
				...current,
				agentMessage( __( 'Something went wrong. Please try again in a moment.' ) ),
			] );
		}
	};

	const isProcessing = activeRun !== null || refine.isPending;
	const thinkingMessage = useMemo( () => {
		if ( ! activeRun ) {
			return undefined;
		}
		return sprintf(
			/* translators: %d is the 1-based page number being refined. */
			__( 'Updating page %d…' ),
			activeRun.userFacingPage
		);
	}, [ activeRun ] );

	const placeholderHint = useMemo( () => {
		// totalPages includes the cover; the lowest refinable page is 2.
		return sprintf(
			/* translators: %d is the highest body page number, 1-based with cover. */
			__( 'Tell me what to change. e.g. "page %d is clipped".' ),
			Math.max( 2, totalPages )
		);
	}, [ totalPages ] );

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
