import { localeRegexString } from '@automattic/i18n-utils';
import debugFactory from 'debug';
import { pick } from 'lodash';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { bumpStat, bumpStatWithPageView } from 'calypso/lib/analytics/mc';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isDiscoveryV2Enabled } from 'calypso/reader/discover/helper';

const debug = debugFactory( 'calypso:reader:stats' );

export function recordAction( action ) {
	debug( 'reader action', action );
	bumpStat( 'reader_actions', action );
}

export function recordGaEvent( action, label, value ) {
	debug( 'reader ga event', ...arguments );
	gaRecordEvent( 'Reader', action, label, value );
}

export function recordPermalinkClick( source, post, eventProperties = {} ) {
	bumpStat( {
		reader_actions: 'visited_post_permalink',
		reader_permalink_source: source,
	} );
	recordGaEvent( 'Clicked Post Permalink', source );
	const trackEvent = 'calypso_reader_permalink_click';

	// Add source as Tracks event property
	eventProperties = Object.assign( { source }, eventProperties );

	if ( post ) {
		recordTrackForPost( trackEvent, post, eventProperties );
	} else {
		recordTrack( trackEvent, eventProperties );
	}
}

function getLocation( path ) {
	const searchParams = new URLSearchParams( path.slice( path.indexOf( '?' ) ) );

	if ( path === undefined || path === '' ) {
		return 'unknown';
	}
	if ( path === '/reader' ) {
		return 'following';
	}
	if ( path.indexOf( '/reader/a8c' ) === 0 ) {
		return 'following_a8c';
	}
	if ( path.indexOf( '/reader/p2' ) === 0 ) {
		return 'following_p2';
	}
	if ( path.indexOf( '/tag/' ) === 0 ) {
		const sort = searchParams.get( 'sort' );
		return `topic_page:${ sort === 'relevance' ? 'relevance' : 'date' }`;
	}
	if ( path.match( /^\/reader\/(blogs|feeds)\/([0-9]+)\/posts\/([0-9]+)$/i ) ) {
		return 'single_post';
	}
	if ( path.match( /^\/reader\/(blogs|feeds)\/([0-9]+)$/i ) ) {
		return 'blog_page';
	}
	if ( path.indexOf( '/reader/list/' ) === 0 ) {
		return 'list';
	}
	if ( path.indexOf( '/activities/likes' ) === 0 ) {
		return 'postlike';
	}
	if ( path.indexOf( '/discover' ) === 0 ) {
		if ( isDiscoveryV2Enabled() ) {
			const selectedTag = searchParams.get( 'selectedTag' );
			if ( path.indexOf( '/discover/add-new' ) === 0 ) {
				return 'discover_addnew';
			} else if ( path.indexOf( '/discover/firstposts' ) === 0 ) {
				return 'discover_firstposts';
			} else if ( path.indexOf( '/discover/reddit' ) === 0 ) {
				return 'discover_reddit';
			} else if ( path.indexOf( '/discover/latest' ) === 0 ) {
				return 'discover_latest';
			} else if ( path.indexOf( '/discover/tags' ) === 0 ) {
				return `discover_tag:${ selectedTag }`;
			} else if ( path.split( '?' )[ 0 ] === '/discover' ) {
				return `discover_recommended`;
			}
			// Ideally we should not get here, but its good to have a fallback if other tabs are
			// added and not handled.
			return `discover_unknown`;
		}

		// old discover v1, can be removed once above feature check is fully rolled out.
		const selectedTab = searchParams.get( 'selectedTab' );
		if ( ! selectedTab || selectedTab === 'recommended' ) {
			return 'discover_recommended';
		} else if ( selectedTab === 'latest' ) {
			return 'discover_latest';
		} else if ( selectedTab === 'firstposts' ) {
			return 'discover_firstposts';
		}
		return `discover_tag:${ selectedTab }`;
	}
	if ( path.match( new RegExp( `^(/${ localeRegexString })?/reader/search` ) ) ) {
		return 'search';
	}
	if ( path.indexOf( '/reader/conversations/a8c' ) === 0 ) {
		return 'conversations_a8c';
	}
	if ( path.indexOf( '/reader/conversations' ) === 0 ) {
		return 'conversations';
	}
	if ( path.indexOf( '/home' ) === 0 ) {
		return 'home';
	}
	return 'unknown';
}

/**
 *
 * @param {Object} eventProperties extra event properties to add
 * @param {*} pathnameOverride Overwrites location used for determining ui_algo. See notes in
 * `recordTrack` function docs below for more info.
 * @param {Object|null} post Optional post object used to build post event props.
 * @returns new eventProperties object with default reader values added.
 */
export function buildReaderTracksEventProps( eventProperties, pathnameOverride, post ) {
	const location = getLocation(
		pathnameOverride || window.location.pathname + window.location.search
	);
	let composedProperties = Object.assign( { ui_algo: location }, eventProperties );
	if ( post ) {
		composedProperties = Object.assign( getTracksPropertiesForPost( post ), composedProperties );
	}
	return composedProperties;
}

/**
 * @param {*} eventName track event name
 * @param {*} eventProperties extra event props
 * @param {{pathnameOverride: string}} [pathnameOverride] Overwrites the location for ui_algo Useful for when
 *   recordTrack() is called after loading the next window.
 *   For example: opening an article (calypso_reader_article_opened) would call
 *   recordTrack after changing windows and would result in a `ui_algo: single_post`
 *   regardless of the stream the post was opened. This now allows the article_opened
 *   Tracks event to correctly specify which stream the post was opened.
 * @deprecated Use the recordReaderTracksEvent action instead.
 */
export function recordTrack( eventName, eventProperties, { pathnameOverride } = {} ) {
	debug( 'reader track', ...arguments );

	eventProperties = buildReaderTracksEventProps( eventProperties, pathnameOverride );

	if ( process.env.NODE_ENV !== 'production' ) {
		if (
			'blog_id' in eventProperties &&
			'post_id' in eventProperties &&
			! ( 'is_jetpack' in eventProperties )
		) {
			// eslint-disable-next-line no-console
			console.warn( 'consider using recordTrackForPost...', eventName, eventProperties );
		}
	}

	recordTracksEvent( eventName, eventProperties );
}

const allowedTracksRailcarEventNames = new Set();
allowedTracksRailcarEventNames
	.add( 'calypso_reader_related_post_from_same_site_clicked' )
	.add( 'calypso_reader_related_post_from_other_site_clicked' )
	.add( 'calypso_reader_related_post_site_clicked' )
	.add( 'calypso_reader_article_liked' )
	.add( 'calypso_reader_article_commented_on' )
	.add( 'calypso_reader_article_opened' )
	.add( 'calypso_reader_searchcard_clicked' )
	.add( 'calypso_reader_author_link_clicked' )
	.add( 'calypso_reader_permalink_click' )
	.add( 'calypso_reader_recommended_post_clicked' )
	.add( 'calypso_reader_recommended_site_clicked' )
	.add( 'calypso_reader_recommended_post_dismissed' )
	.add( 'calypso_reader_article_engaged_time' );

export function recordTracksRailcar( action, eventName, railcar, overrides = {} ) {
	// flatten the railcar down into the event props
	recordTrack(
		action,
		Object.assign(
			eventName ? { action: eventName.replace( 'calypso_reader_', '' ) } : {},
			railcar,
			overrides
		)
	);
}

export function recordTracksRailcarRender( eventName, railcar, overrides ) {
	return recordTracksRailcar( 'calypso_traintracks_render', eventName, railcar, overrides );
}

export function recordTracksRailcarInteract( eventName, railcar, overrides ) {
	return recordTracksRailcar( 'calypso_traintracks_interact', eventName, railcar, overrides );
}

export function recordTrackForPost( eventName, post = {}, additionalProps = {}, options ) {
	recordTrack( eventName, { ...getTracksPropertiesForPost( post ), ...additionalProps }, options );
	if ( post.railcar && allowedTracksRailcarEventNames.has( eventName ) ) {
		// check for overrides for the railcar
		recordTracksRailcarInteract(
			eventName,
			post.railcar,
			pick( additionalProps, [ 'ui_position', 'ui_algo' ] )
		);
	} else if ( process.env.NODE_ENV !== 'production' && post.railcar ) {
		// eslint-disable-next-line no-console
		console.warn( 'Consider allowing reader track', eventName );
	}
}

export function getTracksPropertiesForPost( post = {} ) {
	return {
		blog_id: ! post.is_external && post.site_ID > 0 ? post.site_ID : undefined,
		post_id: ! post.is_external && post.ID > 0 ? post.ID : undefined,
		feed_id: post.feed_ID > 0 ? post.feed_ID : undefined,
		feed_item_id: post.feed_item_ID > 0 ? post.feed_item_ID : undefined,
		is_jetpack: post.is_jetpack,
	};
}

export function recordTrackWithRailcar( eventName, railcar, eventProperties ) {
	recordTrack( eventName, eventProperties );
	recordTracksRailcarInteract(
		eventName,
		railcar,
		pick( eventProperties, [ 'ui_position', 'ui_algo' ] )
	);
}

export function pageViewForPost( blogId, blogUrl, postId, isPrivate ) {
	if ( ! blogId || ! blogUrl || ! postId ) {
		return;
	}

	const params = {
		ref: 'http://wordpress.com/',
		reader: 1,
		host: blogUrl.replace( /.*?:\/\//g, '' ),
		blog: blogId,
		post: postId,
	};
	if ( isPrivate ) {
		params.priv = 1;
	}
	debug( 'reader page view for post', params );
	bumpStatWithPageView( params );
}

export function recordFollow( url, railcar, additionalProps = {} ) {
	const source =
		additionalProps.follow_source ||
		getLocation( window.location.pathname + window.location.search );
	bumpStat( 'reader_follows', source );
	recordAction( 'followed_blog' );
	recordGaEvent( 'Clicked Follow Blog', source );
	recordTrack( 'calypso_reader_site_followed', {
		url,
		source,
		...additionalProps,
	} );
	if ( railcar ) {
		recordTracksRailcarInteract( 'site_followed', railcar );
	}
}

export function recordUnfollow( url, railcar, additionalProps = {} ) {
	const source =
		additionalProps.follow_source ||
		getLocation( window.location.pathname + window.location.search );
	bumpStat( 'reader_unfollows', source );
	recordAction( 'unfollowed_blog' );
	recordGaEvent( 'Clicked Unfollow Blog', source );
	recordTrack( 'calypso_reader_site_unfollowed', {
		url,
		source,
		...additionalProps,
	} );
	if ( railcar ) {
		recordTracksRailcarInteract( 'site_unfollowed', railcar );
	}
}
