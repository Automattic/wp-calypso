/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import feedStreamFactory from 'lib/feed-stream-store';
import { recordTrack } from 'reader/stats';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, trackScrollPage } from 'reader/controller-helper';
import AsyncLoad from 'components/async-load';

const analyticsPageTitle = 'Reader';

export default {
	listListing(context, next) {
	    const basePath = '/read/list/:owner/:slug',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > List > ' + context.params.user + ' - ' + context.params.list,
			listStore = feedStreamFactory( 'list:' + context.params.user + '-' + context.params.list ),
			mcKey = 'list';

		ensureStoreLoading( listStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_list_loaded', {
			list_owner: context.params.user,
			list_slug: context.params.list
		} );

		context.primary = <AsyncLoad require="reader/list-stream"
			key={ 'tag-' + context.params.user + '-' + context.params.list }
			postsStore={ listStore }
			owner={ encodeURIComponent( context.params.user ) }
			slug={ encodeURIComponent( context.params.list ) }
			showPrimaryFollowButtonOnCards={ false }
			trackScrollPage={ trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			) }
			onUpdatesShown={ trackUpdatesLoaded.bind( null, mcKey ) }
		/>;
		next();
	}
};
