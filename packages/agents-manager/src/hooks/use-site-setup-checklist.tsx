import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import SiteSetupChecklist from '../components/site-setup-checklist';
import { isSiteSetupChecklistEnabled, toChecklistItems } from '../utils/site-setup-checklist';
import { fetchSiteSetupTasks, getSiteSetupSiteId } from '../utils/site-setup-tasks';
import type { ChecklistItem } from '@automattic/agenttic-ui';
import type { ReactNode } from 'react';

interface Config {
	enabled: boolean;
	isProcessing: boolean;
	isLoadingConversation: boolean;
	hasConversationMessages: boolean;
	/** The conversation holds a message sent from the checklist (see `isSiteSetupChat`). */
	isStartedFromChecklist: boolean;
}

export interface SiteSetupChecklistState {
	/** The list is still being read; the chat should not show its empty view yet. */
	isLoading: boolean;
	/** The checklist in a new chat's empty view, where the suggestion chips go. */
	emptyViewContent: ReactNode | null;
	/** The checklist pinned above the messages of a chat started from it. */
	pinnedContent: ReactNode | null;
}

export const SITE_SETUP_TASKS_QUERY_KEY = [ 'agents-manager-site-setup-tasks' ];

const NONE: SiteSetupChecklistState = {
	isLoading: false,
	emptyViewContent: null,
	pinnedContent: null,
};

/**
 * The Site Setup checklist in an editor chat. A new chat shows it in the empty
 * view, in place of the suggestion chips; once the user picks a task the chat
 * is one "started from the list", and the checklist moves to a pinned block
 * above the messages. Reads
 * the list by running the backend `wpcom/get-site-setup-tasks` ability, keeps
 * a picked task marked as started until the server says otherwise, and
 * re-reads the list after every agent turn, since a turn may complete a task.
 * Any other chat gets nothing.
 */
export default function useSiteSetupChecklist( {
	enabled,
	isProcessing,
	isLoadingConversation,
	hasConversationMessages,
	isStartedFromChecklist,
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

	const [ startedIds, setStartedIds ] = useState< ReadonlySet< string > >( () => new Set() );
	const onSelect = useCallback( ( item: ChecklistItem ) => {
		setStartedIds( ( previous ) => new Set( previous ).add( item.id ) );
	}, [] );

	return useMemo( () => {
		if ( ! isEnabled ) {
			return NONE;
		}

		if ( isLoading || isLoadingConversation ) {
			return { ...NONE, isLoading: true };
		}

		if ( ! data?.eligible || data.tasks.length === 0 ) {
			return NONE;
		}

		const items = toChecklistItems( data.tasks, startedIds );

		if ( startedIds.size > 0 || isStartedFromChecklist ) {
			return {
				...NONE,
				pinnedContent: (
					<SiteSetupChecklist items={ items } collapsedByDefault onSelect={ onSelect } pinned />
				),
			};
		}

		if ( hasConversationMessages ) {
			return NONE;
		}

		return {
			...NONE,
			emptyViewContent: (
				<SiteSetupChecklist items={ items } collapsedByDefault={ false } onSelect={ onSelect } />
			),
		};
	}, [
		isEnabled,
		isLoading,
		isLoadingConversation,
		data,
		startedIds,
		hasConversationMessages,
		isStartedFromChecklist,
		onSelect,
	] );
}
