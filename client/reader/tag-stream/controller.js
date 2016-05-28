/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import trim from 'lodash/trim';

/**
 * Internal dependencies
 */
import feedStreamFactory from 'lib/feed-stream-store';
import { recordTrack } from 'reader/stats';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, trackScrollPage, setPageTitle } from 'reader/controller-helper';

const analyticsPageTitle = 'Reader';

export default {
	tagListing( context ) {
		var TagStream = require( 'reader/tag-stream/main' ),
			basePath = '/tag/:slug',
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

		ReactDom.render(
			React.createElement( TagStream, {
				key: 'tag-' + encodedTag,
				store: tagStore,
				tag: encodedTag,
				setPageTitle: setPageTitle,
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				),
				onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
				showBack: !! context.lastRoute
			} ),
			document.getElementById( 'primary' )
		);
	}
};
