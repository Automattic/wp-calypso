import assign from 'lodash/assign';
import debugFactory from 'debug';

import { mc, ga, tracks } from 'lib/analytics';

import SubscriptionStore from 'lib/reader-feed-subscriptions';

const debug = debugFactory( 'calypso:reader:stats' );

export function recordAction( action ) {
	debug( 'reader action', action );
	mc.bumpStat( 'reader_actions', action );
}

export function recordGaEvent( action, label, value ) {
	debug( 'reader ga event', ...arguments );
	ga.recordEvent( 'Reader', action, label, value );
}

export function recordPermalinkClick( where ) {
	mc.bumpStat( {
		reader_actions: 'visited_post_permalink',
		reader_permalink_source: where
	} );
	recordTrack( 'calypso_reader_permalink_click', {
		source: where
	} );
}

function getLocation() {
	if ( typeof window === 'undefined' ) {
		return 'unknown';
	}

	let path = window.location.pathname;
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
	if ( path.indexOf( '/discover' ) === 0 ) {
		return 'discover';
	}
	if ( path.indexOf( '/read/recommendations/posts' ) === 0 ) {
		return 'recommended_posts';
	}
	return 'unknown';
}

export function recordFollow( url ) {
	const source = getLocation();
	mc.bumpStat( 'reader_follows', source );
	recordAction( 'followed_blog' );
	recordGaEvent( 'Clicked Follow Blog', source );
	recordTrack( 'calypso_reader_site_followed', {
		url,
		source
	} );
}

export function recordUnfollow( url ) {
	const source = getLocation();
	mc.bumpStat( 'reader_unfollows', source );
	recordAction( 'unfollowed_blog' );
	recordGaEvent( 'Clicked Unfollow Blog', source );
	recordTrack( 'calypso_reader_site_unfollowed', {
		url,
		source
	} );
}

export function recordTrack( eventName, eventProperties ) {
	debug( 'reader track', ...arguments );
	const subCount = SubscriptionStore.getTotalSubscriptions();
	if ( subCount != null ) {
		eventProperties = Object.assign( { subscription_count: subCount }, eventProperties );
	}
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( 'blog_id' in eventProperties && 'post_id' in eventProperties && ! 'is_jetpack' in eventProperties ) {
			console.warn( 'consider using recordTrackForPost...', eventName, eventProperties );
		}
	}
	tracks.recordEvent( eventName, eventProperties );
}

const tracksRailcarEventWhitelist = new Set();
tracksRailcarEventWhitelist
	.add( 'calypso_reader_related_post_clicked' )
	.add( 'calypso_reader_related_post_site_clicked' )
	.add( 'calypso_reader_article_liked' )
	.add( 'calypso_reader_article_commented_on' )
	.add( 'calypso_reader_article_opened' )
;

export function recordTrackForPost( eventName, post = {}, additionalProps = {} ) {
	recordTrack( eventName, assign( {
		blog_id: ! post.is_external && post.site_ID > 0 ? post.site_ID : undefined,
		post_id: ! post.is_external && post.ID > 0 ? post.ID : undefined,
		feed_id: post.feed_ID > 0 ? post.feed_ID : undefined,
		feed_item_id: post.feed_item_ID > 0 ? post.feed_item_ID : undefined,
		is_jetpack: post.is_jetpack
	}, additionalProps ) );
	if ( post.railcar && tracksRailcarEventWhitelist.has( eventName ) ) {
		recordTrack( 'calypso_traintracks_interact', {
			action: eventName.replace( 'calypso_reader_', '' ),
			railcar: post.railcar
		} );
	} else if ( process.env.NODE_ENV !== 'production' && post.railcar ) {
		console.warn( 'Consider whitelisting reader track', eventName );
	}
}

export function pageViewForPost( blogId, blogUrl, postId, isPrivate ) {
	let params = {
		ref: 'http://wordpress.com/',
		reader: 1,
		host: blogUrl.replace( /.*?:\/\//g, '' ),
		blog: blogId,
		post: postId
	};
	if ( isPrivate ) {
		params.priv = 1;
	}
	debug( 'reader page view for post', params );
	mc.bumpStatWithPageView( params );
}
