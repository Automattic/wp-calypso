import type { InboxTab } from './tabs';
import type { Conversation } from '../group-notes';

export function filterConversations(
	conversations: Conversation[],
	tab: InboxTab,
	search: string
): Conversation[] {
	if ( tab === 'yours' ) {
		return [];
	}
	const term = search.trim().toLowerCase();
	return conversations.filter(
		( { unreadNoteIds, title, excerpt } ) =>
			( tab === 'all' || unreadNoteIds.length > 0 ) &&
			( ! term || title.toLowerCase().includes( term ) || excerpt.toLowerCase().includes( term ) )
	);
}
