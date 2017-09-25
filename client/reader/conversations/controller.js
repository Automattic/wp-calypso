/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import feedStreamStore from 'lib/feed-stream-store';
import { renderWithReduxStore } from 'lib/react-helpers';
import route from 'lib/route';
import { trackPageLoad, trackScrollPage, ensureStoreLoading } from 'reader/controller-helper';
import { recordTrack } from 'reader/stats';

export function conversations( context ) {
	const basePath = route.sectionify( context.path );
	const mcKey = 'conversations';
	const title = 'Reader > Conversations';

	trackPageLoad( basePath, 'Reader > Conversations', mcKey );
	recordTrack( 'calypso_reader_conversations_viewed' );

	const convoStream = feedStreamStore( 'conversations' );
	ensureStoreLoading( convoStream, context );

	const scrollTracker = trackScrollPage.bind( null, '/read/conversations', title, 'Reader', mcKey );

	renderWithReduxStore(
		<AsyncLoad
			require="reader/conversations/stream"
			key={ 'conversations' }
			title="Conversations"
			store={ convoStream }
			trackScrollPage={ scrollTracker }
		/>,
		document.getElementById( 'primary' ),
		context.store
	);
}

export function conversationsA8c( context ) {
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

	renderWithReduxStore(
		<AsyncLoad
			require="reader/conversations/stream"
			key={ 'conversations' }
			title="Conversations @ Automattic"
			store={ convoStream }
			trackScrollPage={ scrollTracker }
		/>,
		document.getElementById( 'primary' ),
		context.store
	);
}
