/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import route from 'lib/route';
import { recordTrack } from 'reader/stats';
import { renderWithReduxStore } from 'lib/react-helpers';
import AsyncLoad from 'components/async-load';
import { trackPageLoad, trackScrollPage, ensureStoreLoading } from 'reader/controller-helper';
import feedStreamStore from 'lib/feed-stream-store';

export function conversations( context ) {
	const basePath = route.sectionify( context.path );
	const mcKey = 'conversations';
	const title = 'Reader > Conversations';

	trackPageLoad( basePath, 'Reader > Conversations', mcKey );
	recordTrack( 'calypso_reader_discover_viewed' );

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
		context.store,
	);
}
