/**
 * External dependencies
 */
import React from 'react';
import trim from 'lodash/trim';

/**
 * Internal dependencies
 */
import feedStreamFactory from 'lib/feed-stream-store';
import { recordTrack } from 'reader/stats';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, trackScrollPage } from 'reader/controller-helper';
import { renderWithReduxStore } from 'lib/react-helpers';
import AsyncLoad from 'components/async-load';

const analyticsPageTitle = 'Reader';

const exported = {
	tagListing( context ) {
		var basePath = '/tag/:slug',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Tag > ' + context.params.tag,
			tagSlug = trim( context.params.tag )
				.toLowerCase()
				.replace( /\s+/g, '-' )
				.replace( /-{2,}/g, '-' ),
			encodedTag = encodeURIComponent( tagSlug ).toLowerCase(),
			tagStore = feedStreamFactory( 'tag:' + tagSlug ),
			mcKey = 'topic';

		ensureStoreLoading( tagStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_tag_loaded', {
			tag: tagSlug
		} );

		renderWithReduxStore(
			<AsyncLoad require="reader/tag-stream/main"
				key={ 'tag-' + encodedTag }
				postsStore={ tagStore }
				tag={ encodedTag }
				decodedTag={ tagSlug }
				trackScrollPage={ trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				) }
				onUpdatesShown={ trackUpdatesLoaded.bind( null, mcKey ) }
				showBack={ !! context.lastRoute }
				showPrimaryFollowButtonOnCards={ true }
			/>,
			document.getElementById( 'primary' ),
			context.store
		);
	}
};

export default exported;

export const {
    tagListing
} = exported;
