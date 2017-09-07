/** @format */
/**
 * External Dependencies
 */
import { assign, partial, pick } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
import { mc, ga, tracks } from 'lib/analytics';

const debug = debugFactory( 'calypso:reader:stats' );

export function recordAction( action ) {
	debug( 'reader action', action );
	mc.bumpStat( 'reader_actions', action );
}

export function recordGaEvent( action, label, value ) {
	debug( 'reader ga event', ...arguments );
	ga.recordEvent( 'Reader', action, label, value );
}

export function recordPermalinkClick( where, post ) {
	mc.bumpStat( {
		reader_actions: 'visited_post_permalink',
		reader_permalink_source: where,
	} );
	recordGaEvent( 'Clicked Post Permalink', where );
	const trackEvent = 'calypso_reader_permalink_click';
	const args = {
		source: where,
	};
	if ( post ) {
		recordTrackForPost( trackEvent, post, args );
	} else {
		recordTrack( trackEvent, args );
	}
}

function getLocation() {
	if ( typeof window === 'undefined' ) {
		return 'unknown';
	}

	const path = window.location.pathname;
	if ( path === '/' ) {
		return 'following';
	}
	if ( path.indexOf( '/tag/' ) === 0 ) {
		return 'topic_page';
	}
	if ( path.match( /^\/read\/(blogs|feeds)\/([0-9]+)\/posts\/([0-9]+)$/i ) ) {
		return 'single_post';
	}
	if ( path.match( /^\/read\/(blogs|feeds)\/([0-9]+)$/i ) ) {
		return 'blog_page';
	}
	if ( path.indexOf( '/read/list/' ) === 0 ) {
		return 'list';
	}
	if ( path.indexOf( '/activities/likes' ) === 0 ) {
		return 'postlike';
	}
	if ( path.indexOf( '/recommendations/mine' ) === 0 ) {
		return 'recommended_foryou';
	}
	if ( path.indexOf( '/recommendations' ) === 0 ) {
		return 'recommended_topics';
	}
	if ( path.indexOf( '/following/edit' ) === 0 ) {
		return 'following_edit';
	}
	if ( path.indexOf( '/following/manage' ) === 0 ) {
		return 'following_manage';
	}
	if ( path.indexOf( '/discover' ) === 0 ) {
		return 'discover';
	}
	if ( path.indexOf( '/read/recommendations/posts' ) === 0 ) {
		return 'recommended_posts';
	}
	if ( path.indexOf( '/read/search' ) === 0 ) {
		return 'search';
	}
	return 'unknown';
}

export function recordTrack( eventName, eventProperties ) {
	debug( 'reader track', ...arguments );
	const subCount = 0; // todo: fix subCount by moving to redux middleware for recordTrack

	// Add location as ui_algo prop
	const location = getLocation();
	eventProperties = Object.assign( { ui_algo: location }, eventProperties );

	if ( subCount != null ) {
		eventProperties = Object.assign( { subscription_count: subCount }, eventProperties );
	}

	if ( process.env.NODE_ENV !== 'production' ) {
		if (
			'blog_id' in eventProperties &&
			'post_id' in eventProperties &&
			! ( 'is_jetpack' in eventProperties )
		) {
			console.warn( 'consider using recordTrackForPost...', eventName, eventProperties ); //eslint-disable-line no-console
		}
	}

	tracks.recordEvent( eventName, eventProperties );
}

const tracksRailcarEventWhitelist = new Set();
tracksRailcarEventWhitelist
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
	.add( 'calypso_reader_recommended_post_dismissed' );

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

export const recordTracksRailcarRender = partial(
	recordTracksRailcar,
	'calypso_traintracks_render'
);
export const recordTracksRailcarInteract = partial(
	recordTracksRailcar,
	'calypso_traintracks_interact'
);

export function recordTrackForPost( eventName, post = {}, additionalProps = {} ) {
	recordTrack(
		eventName,
		assign(
			{
				blog_id: ! post.is_external && post.site_ID > 0 ? post.site_ID : undefined,
				post_id: ! post.is_external && post.ID > 0 ? post.ID : undefined,
				feed_id: post.feed_ID > 0 ? post.feed_ID : undefined,
				feed_item_id: post.feed_item_ID > 0 ? post.feed_item_ID : undefined,
				is_jetpack: post.is_jetpack,
			},
			additionalProps
		)
	);
	if ( post.railcar && tracksRailcarEventWhitelist.has( eventName ) ) {
		// check for overrides for the railcar
		recordTracksRailcarInteract(
			eventName,
			post.railcar,
			pick( additionalProps, [ 'ui_position', 'ui_algo' ] )
		);
	} else if ( process.env.NODE_ENV !== 'production' && post.railcar ) {
		console.warn( 'Consider whitelisting reader track', eventName ); //eslint-disable-line no-console
	}
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
	mc.bumpStatWithPageView( params );
}

export function recordFollow( url, railcar, additionalProps = {} ) {
	const source = additionalProps.source || getLocation();
	mc.bumpStat( 'reader_follows', source );
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
	const source = getLocation();
	mc.bumpStat( 'reader_unfollows', source );
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
