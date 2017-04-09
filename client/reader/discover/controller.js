/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import config from 'config';
import route from 'lib/route';
import feedStreamFactory from 'lib/feed-stream-store';
import { recordTrack } from 'reader/stats';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, trackScrollPage } from 'reader/controller-helper';
import { renderWithReduxStore } from 'lib/react-helpers';
import AsyncLoad from 'components/async-load';

const ANALYTICS_PAGE_TITLE = 'Reader';

export default {
	discover( context ) {
		const blogId = config( 'discover_blog_id' );
		const basePath = route.sectionify( context.path );
		const fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Site > ' + blogId;
		const feedStore = feedStreamFactory( 'site:' + blogId );
		const featuredStore = feedStreamFactory( `featured:${ blogId }` );

		const mcKey = 'discover';

		ensureStoreLoading( feedStore, context );
		ensureStoreLoading( featuredStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_discover_viewed' );

		renderWithReduxStore(
			<AsyncLoad
				require="reader/site-stream"
				key={ 'site-' + blogId }
				postsStore={ feedStore }
				siteId={ +blogId }
				title="Discover"
				trackScrollPage={ trackScrollPage.bind(
						null,
						basePath,
						fullAnalyticsPageTitle,
						ANALYTICS_PAGE_TITLE,
						mcKey
					)
				}
				onUpdatesShown={ trackUpdatesLoaded.bind( null, mcKey ) }
				suppressSiteNameLink={ true }
				showPrimaryFollowButtonOnCards={ false }
				isDiscoverStream={ true }
				showBack={ false }
				className="is-discover-stream is-site-stream"
				featuredStore={ featuredStore }
			/>,
			document.getElementById( 'primary' ),
			context.store
		);
	}
};
