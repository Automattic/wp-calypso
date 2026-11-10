import { readConversationsQuery, siteCommentsInfiniteQuery } from '@automattic/api-queries';
import AsyncLoad from 'calypso/components/async-load';
import { sectionify } from 'calypso/lib/route';
import { trackPageLoad, trackScrollPage } from 'calypso/reader/controller-helper';
import { ConversationsInboxPlaceholder } from 'calypso/reader/conversations/inbox/placeholder';
import { recordTrack } from 'calypso/reader/stats';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

const loadStream = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-conversations-stream" */ 'calypso/reader/conversations/stream'
	);

const loadInbox = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-conversations-inbox" */ 'calypso/reader/conversations/inbox'
	).then( ( { ConversationsInbox } ) => ( { default: ConversationsInbox } ) );

export function conversationsInbox( context, next ) {
	// Starts the list while the inbox's code loads; the inbox's first query has the same key.
	// Opening a conversation runs this again, so only fetch when nothing is cached.
	context.queryClient.prefetchInfiniteQuery( { ...readConversationsQuery(), staleTime: Infinity } );
	const siteId = Number( context.params.siteId );
	const postId = Number( context.params.postId );
	if ( siteId && postId ) {
		// <Comments> only mounts once the post loads, so start its first page alongside the post.
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

export function conversationsA8c( context, next ) {
	const basePath = sectionify( context.path );
	const mcKey = 'conversations-a8c';
	const title = 'Reader > Conversations > Automattic';
	const state = context.store.getState();

	trackPageLoad( basePath, 'Reader > Conversations > Automattic', mcKey );
	recordTrack(
		'calypso_reader_conversations_automattic_viewed',
		{},
		{ pathnameOverride: getCurrentRoute( state ) }
	);

	const streamKey = 'conversations-a8c';

	const scrollTracker = trackScrollPage.bind(
		null,
		'/reader/conversations/a8c',
		title,
		'Reader',
		mcKey
	);

	context.primary = (
		<AsyncLoad
			require={ loadStream }
			key="conversations"
			title="Conversations @ Automattic"
			streamKey={ streamKey }
			store={ { id: streamKey } }
			trackScrollPage={ scrollTracker }
			placeholder={ null }
		/>
	);
	next();
}
