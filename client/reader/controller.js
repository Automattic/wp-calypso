/**
 * External Dependencies
 */
import React from 'react';
import page from 'page';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { abtest } from 'lib/abtest';
import { sectionify } from 'lib/route';
import {
	trackPageLoad,
	trackUpdatesLoaded,
	trackScrollPage,
	setPageTitle,
	getStartDate,
} from './controller-helper';
import FeedError from 'reader/feed-error';
import StreamComponent from 'reader/following/main';
import { getPrettyFeedUrl, getPrettySiteUrl } from 'reader/route';
import { recordTrack } from 'reader/stats';
import { preload } from 'sections-helper';
import { requestFeedDiscovery } from 'state/data-getters';
import { waitForData } from 'state/data-layer/http-data';
import AsyncLoad from 'components/async-load';

const analyticsPageTitle = 'Reader';

const activeAbTests = [
	// active tests would go here
];
let lastRoute = null;

function userHasHistory( context ) {
	return !! context.lastRoute;
}

function renderFeedError( context, next ) {
	context.primary = React.createElement( FeedError );
	next();
}

const exported = {
	initAbTests( context, next ) {
		// spin up the ab tests that are currently active for the reader
		activeAbTests.forEach( ( test ) => abtest( test ) );
		next();
	},

	prettyRedirects( context, next ) {
		// Do we have a 'pretty' site or feed URL?
		let redirect;
		if ( context.params.blog_id ) {
			redirect = getPrettySiteUrl( context.params.blog_id );
		} else if ( context.params.feed_id ) {
			redirect = getPrettyFeedUrl( context.params.feed_id );
		}

		if ( redirect ) {
			return page.redirect( redirect );
		}

		next();
	},

	legacyRedirects( context, next ) {
		const legacyPathRegexes = {
			feedStream: /^\/read\/blog\/feed\/([0-9]+)$/i,
			feedFullPost: /^\/read\/post\/feed\/([0-9]+)\/([0-9]+)$/i,
			blogStream: /^\/read\/blog\/id\/([0-9]+)$/i,
			blogFullPost: /^\/read\/post\/id\/([0-9]+)\/([0-9]+)$/i,
		};

		if ( context.path.match( legacyPathRegexes.feedStream ) ) {
			page.redirect( `/read/feeds/${ context.params.feed_id }` );
		} else if ( context.path.match( legacyPathRegexes.feedFullPost ) ) {
			page.redirect( `/read/feeds/${ context.params.feed_id }/posts/${ context.params.post_id }` );
		} else if ( context.path.match( legacyPathRegexes.blogStream ) ) {
			page.redirect( `/read/blogs/${ context.params.blog_id }` );
		} else if ( context.path.match( legacyPathRegexes.blogFullPost ) ) {
			page.redirect( `/read/blogs/${ context.params.blog_id }/posts/${ context.params.post_id }` );
		}

		next();
	},

	updateLastRoute( context, next ) {
		if ( lastRoute ) {
			context.lastRoute = lastRoute;
		}
		lastRoute = context.path;
		next();
	},

	incompleteUrlRedirects( context, next ) {
		let redirect;
		// Have we arrived at a URL ending in /posts? Redirect to feed stream/blog stream
		if ( context.path.match( /^\/read\/feeds\/([0-9]+)\/posts$/i ) ) {
			redirect = `/read/feeds/${ context.params.feed_id }`;
		} else if ( context.path.match( /^\/read\/blogs\/([0-9]+)\/posts$/i ) ) {
			redirect = `/read/blogs/${ context.params.blog_id }`;
		}

		if ( redirect ) {
			return page.redirect( redirect );
		}

		next();
	},

	preloadReaderBundle( context, next ) {
		preload( 'reader' );
		next();
	},

	sidebar( context, next ) {
		context.secondary = (
			<AsyncLoad require="reader/sidebar" path={ context.path } placeholder={ null } />
		);

		next();
	},

	unmountSidebar( context, next ) {
		next();
	},

	following( context, next ) {
		const basePath = sectionify( context.path );
		const fullAnalyticsPageTitle = analyticsPageTitle + ' > Following';
		const mcKey = 'following';
		const startDate = getStartDate( context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_following_loaded' );

		setPageTitle( context, i18n.translate( 'Following' ) );

		// warn: don't async load this only. we need it to keep feed-post-store in the reader bundle
		context.primary = React.createElement( StreamComponent, {
			key: 'following',
			listName: i18n.translate( 'Followed Sites' ),
			streamKey: 'following',
			startDate,
			recsStreamKey: 'custom_recs_posts_with_images',
			showPrimaryFollowButtonOnCards: false,
			trackScrollPage: trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			),
			onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
		} );
		next();
	},

	feedDiscovery( context, next ) {
		if ( ! context.params.feed_id.match( /^\d+$/ ) ) {
			waitForData( {
				feeds: () => requestFeedDiscovery( context.params.feed_id ),
			} )
				.then( ( { feeds } ) => {
					const feed = feeds?.data?.feeds?.[ 0 ];
					if ( feed && feed.feed_ID ) {
						return page.redirect( `/read/feeds/${ feed.feed_ID }` );
					}
				} )
				.catch( function () {
					renderFeedError( context, next );
				} );
		} else {
			next();
		}
	},

	feedListing( context, next ) {
		const feedId = context.params.feed_id;
		if ( ! parseInt( feedId, 10 ) ) {
			next();
			return;
		}

		const basePath = '/read/feeds/:feed_id';
		const fullAnalyticsPageTitle = analyticsPageTitle + ' > Feed > ' + feedId;
		const mcKey = 'blog';

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_blog_preview', { feed_id: feedId } );

		context.primary = (
			<AsyncLoad
				require="reader/feed-stream"
				key={ 'feed-' + feedId }
				streamKey={ 'feed:' + feedId }
				feedId={ +feedId }
				trackScrollPage={ trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				) }
				onUpdatesShown={ trackUpdatesLoaded.bind( null, mcKey ) }
				showPrimaryFollowButtonOnCards={ false }
				suppressSiteNameLink={ true }
				showBack={ userHasHistory( context ) }
				placeholder={ null }
			/>
		);
		next();
	},

	blogListing( context, next ) {
		const basePath = '/read/blogs/:blog_id';
		const blogId = context.params.blog_id;
		const fullAnalyticsPageTitle = analyticsPageTitle + ' > Site > ' + blogId;
		const streamKey = 'site:' + blogId;
		const mcKey = 'blog';

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_blog_preview', {
			blog_id: context.params.blog_id,
		} );

		context.primary = (
			<AsyncLoad
				require="reader/site-stream"
				key={ 'site-' + blogId }
				streamKey={ streamKey }
				siteId={ +blogId }
				trackScrollPage={ trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				) }
				onUpdatesShown={ trackUpdatesLoaded.bind( null, mcKey ) }
				showPrimaryFollowButtonOnCards={ false }
				suppressSiteNameLink={ true }
				showBack={ userHasHistory( context ) }
				placeholder={ null }
			/>
		);
		next();
	},

	readA8C( context, next ) {
		const basePath = sectionify( context.path );
		const fullAnalyticsPageTitle = analyticsPageTitle + ' > A8C';
		const mcKey = 'a8c';
		const streamKey = 'a8c';
		const startDate = getStartDate( context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		setPageTitle( context, 'Automattic' );

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		context.primary = (
			<AsyncLoad
				require="reader/team/main"
				key="read-a8c"
				className="is-a8c"
				listName="Automattic"
				streamKey={ streamKey }
				startDate={ startDate }
				trackScrollPage={ trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				) }
				showPrimaryFollowButtonOnCards={ false }
				onUpdatesShown={ trackUpdatesLoaded.bind( null, mcKey ) }
				placeholder={ null }
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
		next();
	},
};

export const {
	initAbTests,
	prettyRedirects,
	legacyRedirects,
	updateLastRoute,
	incompleteUrlRedirects,
	preloadReaderBundle,
	sidebar,
	unmountSidebar,
	following,
	feedDiscovery,
	feedListing,
	blogListing,
	readA8C,
} = exported;
