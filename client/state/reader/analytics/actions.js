/**
 * External Dependencies
 */
import { partial, pick } from 'lodash';

/**
 * Internal Dependencies
 */
import {
	bumpStat,
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'state/analytics/actions';

export const readerAction = actionName => bumpStat( 'reader_actions', actionName );

export const readerGaEvent = ( action, label, value ) =>
	recordGoogleEvent( 'Reader', action, label, value );

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

export const readerTracksEvent = ( eventName, eventProperties ) => {
	const subCount = null; // todo: fix subCount by moving to super prop

	// Add location as ui_algo prop
	const location = getLocation();
	eventProperties = Object.assign( { ui_algo: location }, eventProperties );

	if ( subCount != null ) {
		eventProperties = Object.assign( { subscription_count: subCount }, eventProperties );
	}

	if ( location === 'topic_page' && ! eventProperties.hasOwnProperty( 'tag' ) ) {
		const tag = decodeURIComponent( window.location.pathname.split( '/tag/' ).pop() );
		eventProperties = Object.assign( { tag: tag }, eventProperties );
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

	return recordTracksEvent( eventName, eventProperties );
};

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

export const recordTracksRailcar = ( action, eventName, railcar, overrides = {} ) =>
	recordTracksEvent(
		action,
		Object.assign(
			{
				action: eventName.replace( 'calypso_reader_', '' ),
			},
			railcar,
			overrides,
		),
	);

export const recordTracksRailcarRender = partial(
	recordTracksRailcar,
	'calypso_traintracks_render',
);
export const recordTracksRailcarInteract = partial(
	recordTracksRailcar,
	'calypso_traintracks_interact',
);

export const recordTrackForPost = ( eventName, post = {}, additionalProps = {} ) => {
	const events = [];
	events.push(
		recordTracksEvent(
			eventName,
			Object.assign(
				{
					blog_id: ! post.is_external && post.site_ID > 0 ? post.site_ID : undefined,
					post_id: ! post.is_external && post.ID > 0 ? post.ID : undefined,
					feed_id: post.feed_ID > 0 ? post.feed_ID : undefined,
					feed_item_id: post.feed_item_ID > 0 ? post.feed_item_ID : undefined,
					is_jetpack: post.is_jetpack,
				},
				additionalProps,
			),
		),
	);
	if ( post.railcar && tracksRailcarEventWhitelist.has( eventName ) ) {
		// check for overrides for the railcar
		events.push(
			recordTracksRailcarInteract(
				eventName,
				post.railcar,
				pick( additionalProps, [ 'ui_position', 'ui_algo' ] ),
			),
		);
	} else if ( process.env.NODE_ENV !== 'production' && post.railcar ) {
		console.warn( 'Consider whitelisting reader track', eventName ); //eslint-disable-line no-console
	}
	return composeAnalytics.apply( null, events );
};

export function recordTrackWithRailcar( eventName, railcar, eventProperties ) {
	recordTrack( eventName, eventProperties );
	recordTracksRailcarInteract(
		eventName,
		railcar,
		pick( eventProperties, [ 'ui_position', 'ui_algo' ] ),
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
	const source = getLocation();
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
