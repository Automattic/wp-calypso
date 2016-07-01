/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import route from 'lib/route';
import titleActions from 'lib/screen-title/actions';
import feedStreamFactory from 'lib/feed-stream-store';
import { recordTrack } from 'reader/stats';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, trackScrollPage, setPageTitle } from 'reader/controller-helper';

const analyticsPageTitle = 'Reader';

export default {
	discover( context ) {
		const
			blogId = config( 'discover_blog_id' ),
			SiteStream = require( 'reader/site-stream' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = `${analyticsPageTitle} > Site > ${blogId}`,
			feedStore = feedStreamFactory( `site:${blogId}` ),
			mcKey = 'discover';

		titleActions.setTitle( 'Discover' );

		ensureStoreLoading( feedStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_discover_viewed' );

		ReactDom.render(
			React.createElement( SiteStream, {
				key: 'site-' + blogId,
				store: feedStore,
				siteId: blogId,
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				),
				onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
				suppressSiteNameLink: true,
				showBack: false
			} ),
			document.getElementById( 'primary' )
		);
	},
	expanded( context ) {
		const
			discoverComponent = require( 'reader/discover/main' ),
			blogId = config( 'discover_blog_id' ),
			basePath = route.sectionify( context.path ),
			fullAnalyticsPageTitle = `${analyticsPageTitle} > Site > ${blogId}`,
			key = 'discover';

		setPageTitle( i18n.translate( 'Discover' ) );
	//	ensureStoreLoading( feedStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, key );
		recordTrack( 'calypso_reader_discover_viewed' );
		console.log('context.store:', context.store );
		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( discoverComponent, { key } )
			),
			document.getElementById( 'primary' )
		);
	}
};
