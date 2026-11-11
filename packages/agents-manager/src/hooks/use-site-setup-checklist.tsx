import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from '@wordpress/element';
import {
	getLastPickedSiteSetupTask,
	getSiteSetupStartedTasks,
	isSiteSetupChecklistEnabled,
	toChecklistItems,
} from '../utils/site-setup-checklist';
import { fetchSiteSetupTasks, getSiteSetupSiteId } from '../utils/site-setup-tasks';
import type { UIMessage } from '@automattic/agenttic-client';
import type { ChecklistItem } from '@automattic/agenttic-ui';

interface Config {
	enabled: boolean;
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
 * picked from it ("started from the list") gets it pinned above the messages,
 * with those tasks in progress. Everything derives from the conversation: a
 * picked task is the user message that carries `promptSource`, live or
 * restored, so a blocked send, a new chat or a remount mid-turn need no state
 * of their own. Reads the list by running the backend
 * `wpcom/get-site-setup-tasks` ability, and re-reads it after every agent
 * turn, since a turn may complete a task.
 */
export default function useSiteSetupChecklist( {
	enabled,
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
	useEffect( () => {
		if ( wasProcessingRef.current && ! isProcessing && isEnabled ) {
			refetch();
		}
		wasProcessingRef.current = isProcessing;
	}, [ isProcessing, isEnabled, refetch ] );

	const startedTasks = useMemo( () => getSiteSetupStartedTasks( messages ), [ messages ] );
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

		if ( startedTasks ) {
			// Several tasks can be in progress at once (the Site Setup page shows
			// them all); the folded list keeps the one picked last, or failing
			// that the first still in progress.
			const items = toChecklistItems( data.tasks, startedTasks );
			const inProgress = items.filter( ( item ) => item.status === 'in-progress' );
			const active = inProgress.find( ( item ) => item.id === lastPickedId ) ?? inProgress[ 0 ];
			return { ...NONE, variant: 'pinned', items, activeItemId: active?.id };
		}
		return hasMessages
			? NONE
			: { ...NONE, variant: 'empty', items: toChecklistItems( data.tasks, new Set() ) };
	}, [
		isEnabled,
		isLoading,
		isLoadingConversation,
		data,
		startedTasks,
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

	return focusHeaderOnMount ? { ...state, focusHeaderOnMount } : state;
}
