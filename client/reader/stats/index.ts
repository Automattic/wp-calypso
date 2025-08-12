import { isEnabled } from '@automattic/calypso-config';
import { localeRegexString } from '@automattic/i18n-utils';
import debugFactory from 'debug';
import { pick } from 'lodash';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { bumpStat, bumpStatWithPageView } from 'calypso/lib/analytics/mc';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

const debug = debugFactory( 'calypso:reader:stats' );

export function recordAction( action: string ) {
	debug( 'reader action', action );
	bumpStat( 'reader_actions', action );
}

export function recordGaEvent( action: string, label?: string, value?: string ) {
	debug( 'reader ga event', action, label, value );
	gaRecordEvent( 'Reader', action, label, value );
}

export function recordPermalinkClick(
	source: string,
	post: Record< string, unknown >,
	eventProperties: Record< string, unknown > = {}
) {
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

export function getLocation( fullPath: string ) {
	const [ path, queryString ] = fullPath.split( '?' );
	const searchParams = new URLSearchParams( queryString );

	if ( path === undefined || path === '' ) {
		return 'unknown';
	}

	if ( path === '/reader' || path.startsWith( '/reader/recent/' ) ) {
		return 'following';
	}

	if ( path.startsWith( '/reader/a8c' ) ) {
		return 'following_a8c';
	}

	if ( path.startsWith( '/reader/p2' ) ) {
		return 'following_p2';
	}

	if ( path.startsWith( '/tag/' ) ) {
		const sort = searchParams.get( 'sort' );
		return `topic_page:${ sort === 'relevance' ? 'relevance' : 'date' }`;
	}

	if ( path.match( /^\/reader\/(blogs|feeds)\/([0-9]+)\/posts\/([0-9]+)$/i ) ) {
		return 'single_post';
	}

	if ( path.match( /^\/reader\/(blogs|feeds)\/([0-9]+)$/i ) ) {
		return 'blog_page';
	}

	if ( path.startsWith( '/reader/list/' ) ) {
		return 'list';
	}

	if ( path.startsWith( '/activities/likes' ) ) {
		return 'postlike';
	}

	if ( path.startsWith( '/discover' ) ) {
		if ( path === '/discover' ) {
			return isEnabled( 'reader/discover/freshly-pressed' )
				? 'freshly-pressed'
				: 'discover_recommended';
		}

		if ( path.startsWith( '/discover/add-new' ) ) {
			return 'discover_addnew';
		}

		if ( path.startsWith( '/discover/firstposts' ) ) {
			return 'discover_firstposts';
		}

		if ( path.startsWith( '/discover/reddit' ) ) {
			return 'discover_reddit';
		}

		if ( path.startsWith( '/discover/latest' ) ) {
			return 'discover_latest';
		}

		if ( path.startsWith( '/discover/tags' ) ) {
			const selectedTag = searchParams.get( 'selectedTag' );
			return `discover_tag:${ selectedTag }`;
		}

		if ( path.startsWith( '/discover/recommended' ) ) {
			return 'discover_recommended';
		}
		// Ideally we should not get here, but its good to have a fallback if other tabs are
		// added and not handled.
		return 'discover_unknown';
	}

	if ( path.match( new RegExp( `^(/${ localeRegexString })?/reader/search` ) ) ) {
		return 'search';
	}

	if ( path.startsWith( '/reader/conversations/a8c' ) ) {
		return 'conversations_a8c';
	}

	if ( path.startsWith( '/reader/conversations' ) ) {
		return 'conversations';
	}

	if ( path.startsWith( '/home' ) ) {
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
export function buildReaderTracksEventProps(
	eventProperties: Record< string, unknown >,
	pathnameOverride?: string,
	post?: Record< string, unknown >
) {
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
export function recordTrack(
	eventName: string,
	eventProperties: Record< string, unknown >,
	{ pathnameOverride }: { pathnameOverride?: string } = {}
) {
	debug( 'reader track', eventName, eventProperties, pathnameOverride );

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

export function recordTracksRailcarRender(
	eventName: string,
	railcar: Record< string, unknown >,
	overrides: Record< string, unknown > = {}
) {
	return recordTracksRailcar( 'calypso_traintracks_render', eventName, railcar, overrides );
}

export function recordTracksRailcarInteract(
	eventName: string,
	railcar: Record< string, unknown >,
	overrides: Record< string, unknown > = {}
) {
	return recordTracksRailcar( 'calypso_traintracks_interact', eventName, railcar, overrides );
}

export function recordTrackForPost(
	eventName: string,
	post: Record< string, unknown > = {},
	additionalProps: Record< string, unknown > = {},
	options?: Record< string, unknown >
) {
	recordTrack( eventName, { ...getTracksPropertiesForPost( post ), ...additionalProps }, options );
	if ( post.railcar && allowedTracksRailcarEventNames.has( eventName ) ) {
		// check for overrides for the railcar
		recordTracksRailcarInteract(
			eventName,
			pick( post, [ 'railcar' ] ),
			pick( additionalProps, [ 'ui_position', 'ui_algo' ] )
		);
	} else if ( process.env.NODE_ENV !== 'production' && post.railcar ) {
		// eslint-disable-next-line no-console
		console.warn( 'Consider allowing reader track', eventName );
	}
}

interface TrackPost {
	blog_id: number;
	post_id: number;
	feed_id: number;
	feed_item_id: number;
	is_jetpack: boolean;
	is_external: boolean;
	site_ID: number;
	ID: number;
	feed_ID: number;
	feed_item_ID: number;
}

export function getTracksPropertiesForPost( post: TrackPost ) {
	return {
		blog_id: ! post.is_external && post.site_ID > 0 ? post.site_ID : undefined,
		post_id: ! post.is_external && post.ID > 0 ? post.ID : undefined,
		feed_id: post.feed_ID > 0 ? post.feed_ID : undefined,
		feed_item_id: post.feed_item_ID > 0 ? post.feed_item_ID : undefined,
		is_jetpack: post.is_jetpack,
	};
}

export function recordTrackWithRailcar(
	eventName: string,
	railcar: Record< string, unknown >,
	eventProperties: Record< string, unknown >
) {
	recordTrack( eventName, eventProperties );
	recordTracksRailcarInteract(
		eventName,
		railcar,
		pick( eventProperties, [ 'ui_position', 'ui_algo' ] )
	);
}

export function pageViewForPost(
	blogId: number,
	blogUrl: string,
	postId: number,
	isPrivate: boolean
) {
	if ( ! blogId || ! blogUrl || ! postId ) {
		return;
	}

	const params = {
		ref: 'http://wordpress.com/',
		reader: 1,
		host: blogUrl.replace( /.*?:\/\//g, '' ),
		blog: blogId,
		post: postId,
		priv: isPrivate ? 1 : undefined,
	};

	debug( 'reader page view for post', params );
	bumpStatWithPageView( params );
}

export function recordFollow(
	url: string,
	railcar: Record< string, unknown >,
	additionalProps: Record< string, unknown > = {}
) {
	const source =
		( additionalProps.follow_source as string ) ??
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

export function recordUnfollow(
	url: string,
	railcar: Record< string, unknown >,
	additionalProps: Record< string, unknown > = {}
) {
	const source =
		( additionalProps.follow_source as string ) ??
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
