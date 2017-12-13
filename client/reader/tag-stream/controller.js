/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import feedStreamFactory from 'lib/feed-stream-store';
import { recordTrack } from 'reader/stats';
import {
	ensureStoreLoading,
	trackPageLoad,
	trackUpdatesLoaded,
	trackScrollPage,
} from 'reader/controller-helper';
import AsyncLoad from 'components/async-load';
import { TAG_PAGE } from 'reader/follow-sources';

const analyticsPageTitle = 'Reader';

export const tagListing = ( context, next ) => {
	const basePath = '/tag/:slug';
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > Tag > ' + context.params.tag;
	const tagSlug = trim( context.params.tag )
		.toLowerCase()
		.replace( /\s+/g, '-' )
		.replace( /-{2,}/g, '-' );
	const encodedTag = encodeURIComponent( tagSlug ).toLowerCase();
	const tagStore = feedStreamFactory( 'tag:' + tagSlug );
	const mcKey = 'topic';

	ensureStoreLoading( tagStore, context );

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_tag_loaded', {
		tag: tagSlug,
	} );

	context.primary = (
		<AsyncLoad
			require="reader/tag-stream/main"
			key={ 'tag-' + encodedTag }
			postsStore={ tagStore }
			encodedTagSlug={ encodedTag }
			decodedTagSlug={ tagSlug }
			trackScrollPage={ trackScrollPage.bind(
				// eslint-disable-line
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			) }
			onUpdatesShown={ trackUpdatesLoaded.bind( null, mcKey ) } // eslint-disable-line
			showBack={ !! context.lastRoute }
			showPrimaryFollowButtonOnCards={ true }
			followSource={ TAG_PAGE }
		/>
	);
	next();
};
