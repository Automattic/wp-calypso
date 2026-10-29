import type { Conversation } from '../group-notes';

export const SORT_ORDERS = [ 'newest_replies', 'your_last_reply', 'most_active' ] as const;

export type SortOrder = ( typeof SORT_ORDERS )[ number ];

export const DEFAULT_SORT_ORDER: SortOrder = 'newest_replies';

const byNewest = ( a: Conversation, b: Conversation ) => b.timestamp - a.timestamp;

const comparators: Record< SortOrder, ( a: Conversation, b: Conversation ) => number > = {
	newest_replies: byNewest,
	your_last_reply: ( a, b ) =>
		( b.lastRepliedTimestamp ?? 0 ) - ( a.lastRepliedTimestamp ?? 0 ) || byNewest( a, b ),
	most_active: ( a, b ) => b.noteIds.length - a.noteIds.length || byNewest( a, b ),
};

export function sortConversations( conversations: Conversation[], sort: SortOrder ) {
	return [ ...conversations ].sort( comparators[ sort ] );
}
