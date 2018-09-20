/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { sectionify } from 'lib/route';
import { recordTrack } from 'reader/stats';
import AsyncLoad from 'components/async-load';
import { trackPageLoad, trackScrollPage } from 'reader/controller-helper';

export function conversations( context, next ) {
	const basePath = sectionify( context.path );
	const mcKey = 'conversations';
	const title = 'Reader > Conversations';

	trackPageLoad( basePath, 'Reader > Conversations', mcKey );
	recordTrack( 'calypso_reader_conversations_viewed' );

	const streamKey = 'conversations';
	const scrollTracker = trackScrollPage.bind( null, '/read/conversations', title, 'Reader', mcKey );

	context.primary = (
		<AsyncLoad
			require="reader/conversations/stream"
			key={ 'conversations' }
			title="Conversations"
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

	trackPageLoad( basePath, 'Reader > Conversations > Automattic', mcKey );
	recordTrack( 'calypso_reader_conversations_automattic_viewed' );

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
			require="reader/conversations/stream"
			key={ 'conversations' }
			title="Conversations @ Automattic"
			streamKey={ streamKey }
			trackScrollPage={ scrollTracker }
		/>
	);
	next();
}
