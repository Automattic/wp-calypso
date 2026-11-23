import { siteCommentsInfiniteQuery } from '@automattic/api-queries';
import AsyncLoad from 'calypso/components/async-load';
import { trackPageLoad } from 'calypso/reader/controller-helper';
import { ConversationsInboxPlaceholder } from 'calypso/reader/conversations/inbox/placeholder';
import { recordTrack } from 'calypso/reader/stats';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { loadInbox, prefetchInbox } from './preload';

export function conversationsInbox( context, next ) {
	prefetchInbox( context.queryClient );
	const siteId = Number( context.params.siteId );
	const postId = Number( context.params.postId );
	if ( siteId && postId ) {
		context.queryClient.prefetchInfiniteQuery( siteCommentsInfiniteQuery( { siteId, postId } ) );
	}
	trackPageLoad(
		'/reader/conversations/inbox',
		'Reader > Conversations > Inbox',
		'conversations-inbox'
	);
	recordTrack(
		'calypso_reader_conversations_viewed',
		{},
		{ pathnameOverride: getCurrentRoute( context.store.getState() ) }
	);

	context.primary = (
		<AsyncLoad
			require={ loadInbox }
			key="conversations-inbox"
			siteId={ context.params.siteId }
			postId={ context.params.postId }
			placeholder={
				<ConversationsInboxPlaceholder
					hasConversation={ Boolean( context.params.siteId && context.params.postId ) }
				/>
			}
		/>
	);
	next();
}
