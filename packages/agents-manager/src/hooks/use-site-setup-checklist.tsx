import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { subscribeToDispatchedPromptSources } from '../utils/prompt-source';
import {
	getLastPickedSiteSetupTask,
	getPickedSiteSetupTask,
	isChatStartedFromSiteSetup,
	isSiteSetupChecklistEnabled,
	SITE_SETUP_PROMPT_SOURCE,
	toChecklistItems,
} from '../utils/site-setup-checklist';
import {
	fetchSiteSetupTasks,
	getSiteSetupSiteId,
	startSiteSetupTask,
	withSiteSetupTasksInProgress,
} from '../utils/site-setup-tasks';
import type { UIMessage } from '@automattic/agenttic-client';
import type { ChecklistItem } from '@automattic/agenttic-ui';

interface Config {
	enabled: boolean;
	isOpen: boolean;
	isProcessing: boolean;
	isLoadingConversation: boolean;
	messages: UIMessage[];
}

export type SiteSetupChecklistVariant = 'empty' | 'pinned';

export interface SiteSetupChecklistState {
	/** The list is still being read; the chat should not show its empty view yet. */
	isLoading: boolean;
	/** Where the checklist goes: a new chat's empty view, pinned above the messages of a chat started from it, or nowhere. */
	variant: SiteSetupChecklistVariant | null;
	items: ChecklistItem[];
	/** The pinned list just replaced the one the user picked from, so it takes the focus. */
	focusHeaderOnMount: boolean;
	/** The task the user is on, the only one a folded pinned list keeps in view. */
	activeItemId?: string;
}

export const SITE_SETUP_TASKS_QUERY_KEY = [ 'agents-manager-site-setup-tasks' ];

const NO_IDS: ReadonlySet< string > = new Set();
const NO_ITEMS: ChecklistItem[] = [];
const NONE: SiteSetupChecklistState = {
	isLoading: false,
	variant: null,
	items: NO_ITEMS,
	focusHeaderOnMount: false,
};

/**
 * The Site Setup checklist in an editor chat. A new chat shows it in the empty
 * view, in place of the suggestion chips; a chat whose messages say a task was
 * picked from it ("started from the list") gets it pinned above the messages.
 * Where the list renders derives from the conversation: a picked task is the
 * user message that carries `promptSource`, live or restored, so a blocked
 * send, a new chat or a remount mid-turn need no state of their own.
 *
 * Task status is the backend's alone, read by running the
 * `wpcom/get-site-setup-tasks` ability, so this list and the Site Setup page
 * never disagree. A pick is recorded there once the composer dispatched its
 * prompt (past any upload) and its turn is running, so a blocked or dropped
 * send and restored history never start anything, and the list is re-read
 * after every agent turn (which may
 * complete a task), when the chat opens (the Site Setup page may have changed
 * it meanwhile) and, through the query's window-focus refetch, when the tab
 * comes back.
 */
export default function useSiteSetupChecklist( {
	enabled,
	isOpen,
	isProcessing,
	isLoadingConversation,
	messages,
}: Config ): SiteSetupChecklistState {
	const siteId = getSiteSetupSiteId();
	const isEnabled = enabled && siteId !== null && isSiteSetupChecklistEnabled();

	const queryClient = useQueryClient();
	const queryKey = useMemo( () => [ ...SITE_SETUP_TASKS_QUERY_KEY, siteId ], [ siteId ] );
	const { data, dataUpdatedAt, isLoading, refetch } = useQuery( {
		queryKey,
		queryFn: () => fetchSiteSetupTasks( siteId as number ),
		enabled: isEnabled,
	} );

	// Tasks picked (started or resumed) during the running turn, shown in
	// progress whatever a read says meanwhile: the pinned list folds down to the
	// in-progress rows, and a task that completes on click would otherwise settle
	// and unfold the list mid-turn. Released when the turn ends, or, for a start
	// still pending then, once a read that finished after its write landed.
	const [ heldIds, setHeldIds ] = useState( NO_IDS );
	const heldIdsRef = useRef( heldIds );
	heldIdsRef.current = heldIds;
	// Starts whose read is still owed, with the cache's data timestamp when their
	// write settled (undefined while the write runs). A refetch promise can resolve
	// cancelled, so only data newer than that counts as the read.
	const pendingStartsRef = useRef( new Map< string, number | undefined >() );
	const isProcessingRef = useRef( isProcessing );
	isProcessingRef.current = isProcessing;

	const release = useCallback( ( ids: Iterable< string > ) => {
		setHeldIds( ( current ) => {
			const next = new Set( current );
			for ( const id of ids ) {
				next.delete( id );
			}
			return next.size === current.size ? current : next;
		} );
	}, [] );

	const wasProcessingRef = useRef( isProcessing );
	const wasOpenRef = useRef( isOpen );

	useEffect( () => {
		const turnEnded = wasProcessingRef.current && ! isProcessing;
		const opened = ! wasOpenRef.current && isOpen;

		wasProcessingRef.current = isProcessing;
		wasOpenRef.current = isOpen;

		if ( turnEnded ) {
			release( [ ...heldIdsRef.current ].filter( ( id ) => ! pendingStartsRef.current.has( id ) ) );
		}

		if ( isEnabled && ( turnEnded || opened ) ) {
			refetch();
		}
	}, [ isProcessing, isOpen, isEnabled, refetch, release ] );

	// Re-read once the write settles, success or failure: landing after the
	// turn-end read, it would otherwise go unseen until the next refetch.
	const startTask = useCallback(
		async ( taskId: string ) => {
			if ( siteId === null ) {
				return;
			}
			pendingStartsRef.current.set( taskId, undefined );

			try {
				await startSiteSetupTask( siteId, taskId );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( '[AgentsManager] Error recording the Site Setup task as started:', error );
			}

			// The cache, not the last render: a read that landed while the write ran
			// may not have rendered yet, and must not count as the read after it.
			pendingStartsRef.current.set(
				taskId,
				queryClient.getQueryState( queryKey )?.dataUpdatedAt ?? 0
			);
			refetch();
		},
		[ siteId, queryClient, queryKey, refetch ]
	);

	// Data newer than a settled write is the read it was owed.
	useEffect( () => {
		const landed = [ ...pendingStartsRef.current ]
			.filter( ( [ , writeSeenAt ] ) => writeSeenAt !== undefined && dataUpdatedAt > writeSeenAt )
			.map( ( [ taskId ] ) => taskId );
		landed.forEach( ( taskId ) => pendingStartsRef.current.delete( taskId ) );
		if ( landed.length > 0 && ! isProcessing ) {
			release( landed );
		}
	}, [ dataUpdatedAt, isProcessing, release ] );

	// A pick is the user message of a prompt the composer dispatched from the
	// checklist, once its turn runs: the composer consumes the prompt source as
	// it dispatches (past any upload), which nothing else does, so restored
	// history never qualifies, even if a tool-call resume starts a turn on it.
	const dispatchedPicksRef = useRef( new Set< string >() );

	useEffect(
		() =>
			subscribeToDispatchedPromptSources( ( promptSource ) => {
				if ( promptSource.source === SITE_SETUP_PROMPT_SOURCE && promptSource.id ) {
					dispatchedPicksRef.current.add( promptSource.id );
				}
			} ),
		[]
	);

	useEffect( () => {
		const newest = messages[ messages.length - 1 ];
		const taskId = newest ? getPickedSiteSetupTask( newest ) : null;
		if ( taskId === null || ! dispatchedPicksRef.current.has( taskId ) ) {
			return;
		}
		if ( ! isEnabled ) {
			dispatchedPicksRef.current.delete( taskId );
			return;
		}
		// Wait for the turn (the message can render a tick before it) and for the list.
		if ( ! isProcessing || ! data ) {
			return;
		}
		dispatchedPicksRef.current.delete( taskId );

		const task = data.tasks.find( ( candidate ) => candidate.id === taskId );
		if ( ! task || ( task.status !== 'todo' && task.status !== 'in-progress' ) ) {
			return;
		}

		setHeldIds( ( current ) => new Set( [ ...current, task.id ] ) );
		if ( task.status === 'todo' ) {
			startTask( task.id );
		}
	}, [ messages, isProcessing, isEnabled, data, startTask ] );

	const isStartedFromList = useMemo( () => isChatStartedFromSiteSetup( messages ), [ messages ] );
	const lastPickedId = useMemo( () => getLastPickedSiteSetupTask( messages ), [ messages ] );
	const hasMessages = messages.length > 0;

	const state = useMemo( (): SiteSetupChecklistState => {
		if ( ! isEnabled ) {
			return NONE;
		}

		if ( isLoading || isLoadingConversation ) {
			return { ...NONE, isLoading: true };
		}

		if ( ! data?.eligible || data.tasks.length === 0 ) {
			return NONE;
		}

		const items = toChecklistItems( withSiteSetupTasksInProgress( data, heldIds ).tasks );

		if ( isStartedFromList ) {
			// Several tasks can be in progress at once (the Site Setup page shows
			// them all); the folded list keeps the one picked last, or failing
			// that the first still in progress.
			const inProgress = items.filter( ( item ) => item.status === 'in-progress' );
			const active = inProgress.find( ( item ) => item.id === lastPickedId ) ?? inProgress[ 0 ];
			return { ...NONE, variant: 'pinned', items, activeItemId: active?.id };
		}

		return hasMessages ? NONE : { ...NONE, variant: 'empty', items };
	}, [
		isEnabled,
		isLoading,
		isLoadingConversation,
		data,
		heldIds,
		isStartedFromList,
		lastPickedId,
		hasMessages,
	] );

	// The variant of the last committed render: only the empty → pinned move,
	// which unmounts the list the user was on, hands the focus over. The handover
	// holds for the conversation it happened in (the pick's own state update
	// re-renders right after it), and ends with the next message.
	const previousVariantRef = useRef< SiteSetupChecklistVariant | null >( null );
	const handoverMessagesRef = useRef< UIMessage[] | null >( null );
	const isHandover = previousVariantRef.current === 'empty' && state.variant === 'pinned';
	const focusHeaderOnMount = isHandover || handoverMessagesRef.current === messages;
	useEffect( () => {
		if ( isHandover ) {
			handoverMessagesRef.current = messages;
		}
		previousVariantRef.current = state.variant;
	} );

	return focusHeaderOnMount ? { ...state, focusHeaderOnMount } : state;
}
