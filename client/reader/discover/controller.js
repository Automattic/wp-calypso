/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import config from 'config';
import feedStreamFactory from 'lib/feed-stream-store';
import { renderWithReduxStore } from 'lib/react-helpers';
import route from 'lib/route';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, trackScrollPage } from 'reader/controller-helper';
import { recordTrack } from 'reader/stats';

const ANALYTICS_PAGE_TITLE = 'Reader';

const exported = {
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
				) }
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
	},
};

export default exported;

export const { discover } = exported;
