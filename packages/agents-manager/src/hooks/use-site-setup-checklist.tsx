import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from '@wordpress/element';
import {
	getLastPickedSiteSetupTask,
	isChatStartedFromSiteSetup,
	isSiteSetupChecklistEnabled,
	toChecklistItems,
} from '../utils/site-setup-checklist';
import {
	fetchSiteSetupTasks,
	getSiteSetupSiteId,
	startSiteSetupTask,
	withSiteSetupTaskStatus,
	type SiteSetupTask,
	type SiteSetupTasks,
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
	/** Records a picked to-do task as started, once the checklist has sent its prompt. */
	onPick: ( item: ChecklistItem ) => Promise< void >;
}

export const SITE_SETUP_TASKS_QUERY_KEY = [ 'agents-manager-site-setup-tasks' ];

const NO_ITEMS: ChecklistItem[] = [];
const NONE: Omit< SiteSetupChecklistState, 'onPick' > = {
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
 * never disagree: picking a task records it as started there before its prompt
 * is sent, and the list is re-read after that, after every agent turn (which
 * may complete a task), when the chat opens (the Site Setup page may have
 * changed it meanwhile) and, through the query's window-focus refetch, when
 * the tab comes back.
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
	const { data, isLoading, refetch } = useQuery( {
		queryKey,
		queryFn: () => fetchSiteSetupTasks( siteId as number ),
		enabled: isEnabled,
	} );

	const wasProcessingRef = useRef( isProcessing );
	const wasOpenRef = useRef( isOpen );

	useEffect( () => {
		const turnEnded = wasProcessingRef.current && ! isProcessing;
		const opened = ! wasOpenRef.current && isOpen;

		wasProcessingRef.current = isProcessing;
		wasOpenRef.current = isOpen;

		if ( isEnabled && ( turnEnded || opened ) ) {
			refetch();
		}
	}, [ isProcessing, isOpen, isEnabled, refetch ] );

	// Runs once the prompt was accepted and sent, never from the row's `action`:
	// a send the composer blocks (credits) must not start anything. The picked
	// task goes in progress in the cache at once and stays so until the turn
	// ends, whatever the server answers: the pinned list folds down to the
	// in-progress rows and mounts right after the send, so a task that
	// completes on click would otherwise arrive there already done and fold
	// away unseen. The re-read at the end of the turn settles it, and the list
	// then reveals the settled row. A failed start is logged and re-read, so
	// the list shows whatever the server has.
	const startTask = useCallback(
		async ( task: SiteSetupTask ) => {
			if ( siteId === null ) {
				return;
			}
			queryClient.setQueryData< SiteSetupTasks >( queryKey, ( current ) =>
				current ? withSiteSetupTaskStatus( current, task.id, 'in-progress' ) : current
			);

			try {
				await startSiteSetupTask( siteId, task.id );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( '[AgentsManager] Error recording the Site Setup task as started:', error );
				refetch();
			}
		},
		[ siteId, queryClient, queryKey, refetch ]
	);

	const onPick = useCallback(
		async ( item: ChecklistItem ) => {
			const task = data?.tasks.find( ( candidate ) => candidate.id === item.id );
			if ( task?.status === 'todo' ) {
				await startTask( task );
			}
		},
		[ data, startTask ]
	);

	const isStartedFromList = useMemo( () => isChatStartedFromSiteSetup( messages ), [ messages ] );
	const lastPickedId = useMemo( () => getLastPickedSiteSetupTask( messages ), [ messages ] );
	const hasMessages = messages.length > 0;

	const state = useMemo( (): Omit< SiteSetupChecklistState, 'onPick' > => {
		if ( ! isEnabled ) {
			return NONE;
		}

		if ( isLoading || isLoadingConversation ) {
			return { ...NONE, isLoading: true };
		}

		if ( ! data?.eligible || data.tasks.length === 0 ) {
			return NONE;
		}

		const items = toChecklistItems( data.tasks );

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
		isStartedFromList,
		lastPickedId,
		hasMessages,
	] );

	// The variant of the last committed render: only the empty → pinned move,
	// which unmounts the list the user was on, hands the focus over.
	const previousVariantRef = useRef< SiteSetupChecklistVariant | null >( null );
	const focusHeaderOnMount = previousVariantRef.current === 'empty' && state.variant === 'pinned';
	useEffect( () => {
		previousVariantRef.current = state.variant;
	} );

	return { ...state, focusHeaderOnMount: state.focusHeaderOnMount || focusHeaderOnMount, onPick };
}
