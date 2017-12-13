/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import route from 'lib/route';
import { recordTrack } from 'reader/stats';
import AsyncLoad from 'components/async-load';
import { trackPageLoad, trackScrollPage, ensureStoreLoading } from 'reader/controller-helper';
import feedStreamStore from 'lib/feed-stream-store';

export function conversations( context, next ) {
	const basePath = route.sectionify( context.path );
	const mcKey = 'conversations';
	const title = 'Reader > Conversations';

	trackPageLoad( basePath, 'Reader > Conversations', mcKey );
	recordTrack( 'calypso_reader_conversations_viewed' );

	const convoStream = feedStreamStore( 'conversations' );
	ensureStoreLoading( convoStream, context );

	const scrollTracker = trackScrollPage.bind( null, '/read/conversations', title, 'Reader', mcKey );

	context.primary = (
		<AsyncLoad
			require="reader/conversations/stream"
			key={ 'conversations' }
			title="Conversations"
			store={ convoStream }
			trackScrollPage={ scrollTracker }
		/>
	);
	next();
}

export function conversationsA8c( context, next ) {
	const basePath = route.sectionify( context.path );
	const mcKey = 'conversations-a8c';
	const title = 'Reader > Conversations > Automattic';

	trackPageLoad( basePath, 'Reader > Conversations > Automattic', mcKey );
	recordTrack( 'calypso_reader_conversations_a8c_viewed' );

	const convoStream = feedStreamStore( 'conversations-a8c' );
	ensureStoreLoading( convoStream, context );

	const scrollTracker = trackScrollPage.bind(
		null,
		'/read/conversations/a8c',
		title,
		'Reader',
		mcKey
	);

	context.primary = (
		<AsyncLoad
			require="reader/conversations/stream"
			key={ 'conversations' }
			title="Conversations @ Automattic"
			store={ convoStream }
			trackScrollPage={ scrollTracker }
		/>
	);
	next();
}
