import AsyncLoad from 'calypso/components/async-load';
import { sectionify } from 'calypso/lib/route';
import { trackPageLoad, trackScrollPage } from 'calypso/reader/controller-helper';
import { recordTrack } from 'calypso/reader/stats';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

export function conversations( context, next ) {
	const basePath = sectionify( context.path );
	const mcKey = 'conversations';
	const title = 'Reader > Conversations';
	const state = context.store.getState();

	trackPageLoad( basePath, 'Reader > Conversations', mcKey );
	recordTrack(
		'calypso_reader_conversations_viewed',
		{},
		{ pathnameOverride: getCurrentRoute( state ) }
	);

	const streamKey = 'conversations';
	const scrollTracker = trackScrollPage.bind( null, '/read/conversations', title, 'Reader', mcKey );

	context.primary = (
		<AsyncLoad
			require="calypso/reader/conversations/stream"
			key="conversations"
			streamKey={ streamKey }
			trackScrollPage={ scrollTracker }
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
		'/read/conversations/a8c',
		title,
		'Reader',
		mcKey
	);

	context.primary = (
		<AsyncLoad
			require="calypso/reader/conversations/stream"
			key="conversations"
			title="Conversations @ Automattic"
			streamKey={ streamKey }
			store={ { id: streamKey } }
			trackScrollPage={ scrollTracker }
		/>
	);
	next();
}
