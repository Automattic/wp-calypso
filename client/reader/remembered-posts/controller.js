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

export function rememberedPosts( context, next ) {
	const basePath = sectionify( context.path );
	const mcKey = 'remembered-posts';
	const title = 'Reader > Remembered Posts';

	trackPageLoad( basePath, 'Reader > Remembered Posts', mcKey );
	recordTrack( 'calypso_reader_remembered_posts_viewed' );

	const streamKey = 'remembered-posts';
	const scrollTracker = trackScrollPage.bind(
		null,
		'/read/remembered-posts',
		title,
		'Reader',
		mcKey
	);

	context.primary = (
		<AsyncLoad
			require="reader/remembered-posts/stream"
			key={ 'remembered-posts' }
			title="rememberedPosts"
			streamKey={ streamKey }
			trackScrollPage={ scrollTracker }
		/>
	);
	next();
}
