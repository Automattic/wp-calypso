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
import { trackPageLoad, ensureStoreLoading } from 'reader/controller-helper';
import feedStreamStore from 'lib/feed-stream-store';

export function conversations( context ) {
	const basePath = route.sectionify( context.path );
	const mcKey = 'conversations';

	trackPageLoad( basePath, 'Reader > Conversations', mcKey );
	recordTrack( 'calypso_reader_discover_viewed' );

	const convoStream = feedStreamStore( 'conversations' );
	ensureStoreLoading( convoStream, context );

	renderWithReduxStore(
		<AsyncLoad
			require="reader/conversations/stream"
			key={ 'conversations' }
			title="Conversations"
			store={ convoStream }
		/>,
		document.getElementById( 'primary' ),
		context.store,
	);
}
