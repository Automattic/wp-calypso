import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from '@wordpress/element';
import {
	isChatStartedFromSiteSetup,
	isSiteSetupChecklistEnabled,
	toChecklistItems,
} from '../utils/site-setup-checklist';
import {
	fetchSiteSetupTasks,
	getSiteSetupSiteId,
	startSiteSetupTask,
	type SiteSetupTask,
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
}

export const SITE_SETUP_TASKS_QUERY_KEY = [ 'agents-manager-site-setup-tasks' ];

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

	const { data, isLoading, refetch } = useQuery( {
		queryKey: [ ...SITE_SETUP_TASKS_QUERY_KEY, siteId ],
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

	// A failed start must not hold the prompt back: the task still reaches the
	// agent, and the next read shows whatever the server has.
	const startTask = useCallback(
		async ( task: SiteSetupTask ) => {
			if ( siteId === null ) {
				return;
			}

			try {
				await startSiteSetupTask( siteId, task.id );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( '[AgentsManager] Error recording the Site Setup task as started:', error );
			}

			refetch();
		},
		[ siteId, refetch ]
	);

	const isStartedFromList = useMemo( () => isChatStartedFromSiteSetup( messages ), [ messages ] );
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

		const items = toChecklistItems( data.tasks, startTask );

		if ( isStartedFromList ) {
			return { ...NONE, variant: 'pinned', items };
		}

		return hasMessages ? NONE : { ...NONE, variant: 'empty', items };
	}, [
		isEnabled,
		isLoading,
		isLoadingConversation,
		data,
		startTask,
		isStartedFromList,
		hasMessages,
	] );

	// The variant of the last committed render: only the empty → pinned move,
	// which unmounts the list the user was on, hands the focus over.
	const previousVariantRef = useRef< SiteSetupChecklistVariant | null >( null );
	const focusHeaderOnMount = previousVariantRef.current === 'empty' && state.variant === 'pinned';
	useEffect( () => {
		previousVariantRef.current = state.variant;
	} );

	return focusHeaderOnMount ? { ...state, focusHeaderOnMount } : state;
}
