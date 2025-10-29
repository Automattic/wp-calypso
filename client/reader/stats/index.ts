import { Railcar } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import debugFactory from 'debug';
import { pick } from 'lodash';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { bumpStat, bumpStatWithPageView } from 'calypso/lib/analytics/mc';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { type TrackPostData } from 'calypso/state/reader/analytics/types';

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
	post: TrackPostData | undefined,
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

const matches = ( pattern: RegExp ) => ( value: string ) => pattern.test( value );

const startsWith = ( path: string | string[] ) => ( value: string ) =>
	Array.isArray( path ) ? path.some( ( p ) => value.startsWith( p ) ) : value.startsWith( path );

const exactMatch = ( path: string | string[] ) => ( value: string ) =>
	Array.isArray( path ) ? path.some( ( p ) => p === value ) : path === value;

const isEmpty = ( value: string | undefined ) => value === '' || value === undefined;

const SearchRoute = matches( /^(\/[^/]+)?\/reader\/search/ );
const SinglePostRoute = matches( /^\/reader\/(blogs|feeds)\/([0-9]+)\/posts\/([0-9]+)$/i );
const BlogPageRoute = matches( /^\/reader\/(blogs|feeds)\/([0-9]+)$/i );

type TrackingResolverFn = ( context: { path: string; searchParams: URLSearchParams } ) => string;
type TrackingResolver = string | TrackingResolverFn;

type RoutesMapping = {
	route: ( path: string ) => boolean;
	tracking: TrackingResolver;
};

const Routes: RoutesMapping[] = [
	{ route: isEmpty, tracking: 'unknown' },

	// Tags
	{
		route: startsWith( '/tag' ),
		tracking: ( { searchParams } ) => {
			const sort = searchParams.get( 'sort' );
			return `topic_page:${ sort === 'relevance' ? 'relevance' : 'date' }`;
		},
	},

	// Following
	{ route: startsWith( '/reader/a8c' ), tracking: 'following_a8c' },
	{ route: startsWith( '/reader/p2' ), tracking: 'following_p2' },
	{ route: startsWith( '/reader/list/' ), tracking: 'list' },

	// Likes
	{ route: startsWith( '/activities/likes' ), tracking: 'postlike' },

	{
		route: exactMatch( '/discover' ),
		tracking: () => {
			const isFreshlyPressedEnabled = isEnabled( 'reader/discover/freshly-pressed' );
			return isFreshlyPressedEnabled ? 'freshly-pressed' : 'discover_recommended';
		},
	},
	// Discover
	{ route: startsWith( '/discover/add-new' ), tracking: 'discover_addnew' },
	{ route: startsWith( '/discover/firstposts' ), tracking: 'discover_firstposts' },
	{ route: startsWith( '/discover/reddit' ), tracking: 'discover_reddit' },
	{ route: startsWith( '/discover/latest' ), tracking: 'discover_latest' },
	{ route: startsWith( '/discover/recommended' ), tracking: 'discover_recommended' },
	{
		route: startsWith( '/discover/tags' ),
		tracking: ( { searchParams } ) => {
			const selectedTag = searchParams.get( 'selectedTag' );
			return `discover_tag:${ selectedTag }`;
		},
	},
	{ route: matches( /discover\/.*/ ), tracking: 'discover_unknown' },

	// Conversations
	{ route: exactMatch( '/reader/conversations' ), tracking: 'conversations' },
	{ route: exactMatch( '/reader/conversations/a8c' ), tracking: 'conversations_a8c' },

	{ route: SinglePostRoute, tracking: 'single_post' },
	{ route: BlogPageRoute, tracking: 'blog_page' },
	{ route: SearchRoute, tracking: 'search' },

	{ route: exactMatch( '/home' ), tracking: 'home' },
	{ route: exactMatch( '/reader' ), tracking: 'following' },

	{ route: startsWith( '/reader/recent/' ), tracking: 'following' },
] as const;

const findConfigByPath = ( path: string, searchParams: URLSearchParams ) => {
	const config = Routes.find( ( route ) => route.route( path ) );
	if ( config ) {
		if ( typeof config.tracking === 'function' ) {
			return config.tracking( { path, searchParams } );
		}
		return config.tracking;
	}
	return null;
};

export function getLocation( fullPath: string ) {
	const [ path, queryString ] = fullPath.split( '?' );
	const searchParams = new URLSearchParams( queryString );

	const config = findConfigByPath( path, searchParams );
	return config || 'unknown';
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
	post?: TrackPostData | null
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
	.add( 'calypso_reader_article_commented_on' )
	.add( 'calypso_reader_article_engaged_time' )
	.add( 'calypso_reader_article_liked' )
	.add( 'calypso_reader_article_opened' )
	.add( 'calypso_reader_article_unliked' )
	.add( 'calypso_reader_author_link_clicked' )
	.add( 'calypso_reader_conversations_post_followed' )
	.add( 'calypso_reader_conversations_post_muted' )
	.add( 'calypso_reader_liked_comment' )
	.add( 'calypso_reader_permalink_click' )
	.add( 'calypso_reader_recommended_post_clicked' )
	.add( 'calypso_reader_recommended_post_dismissed' )
	.add( 'calypso_reader_recommended_site_clicked' )
	.add( 'calypso_reader_related_post_from_other_site_clicked' )
	.add( 'calypso_reader_related_post_from_same_site_clicked' )
	.add( 'calypso_reader_related_post_site_clicked' )
	.add( 'calypso_reader_searchcard_clicked' )
	.add( 'calypso_reader_share_action_picked' )
	.add( 'calypso_reader_share_comment_to_site' )
	.add( 'calypso_reader_share_to_site' )
	.add( 'calypso_reader_share_to_site_comment' )
	.add( 'calypso_reader_unliked_comment' );

export function recordTracksRailcar(
	action: string,
	eventName?: string | null,
	railcar?: Record< string, unknown > | null,
	overrides = {}
) {
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

export const isRailcarEligibleForEvent = ( eventName: string ) => {
	return allowedTracksRailcarEventNames.has( eventName );
};

export const buildRailcarEventProps = (
	eventName: string,
	railcar: Railcar,
	overrides: Record< string, unknown > = {}
) => {
	return {
		...railcar,
		action: eventName.replace( 'calypso_reader_', '' ),
		...overrides,
	};
};

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
	post: TrackPostData,
	additionalProps: Record< string, unknown > = {},
	options?: Record< string, unknown >
) {
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

export function getTracksPropertiesForPost( post: TrackPostData ) {
	return {
		blog_id: ! post.is_external && post.site_ID > 0 ? post.site_ID : undefined,
		post_id: ! post.is_external && post.ID > 0 ? post.ID : undefined,
		feed_id: post.feed_ID > 0 ? post.feed_ID : undefined,
		feed_item_id: post.feed_item_ID > 0 ? post.feed_item_ID : undefined,
		is_jetpack: post.is_jetpack,
		...( post.railcar && { ...post.railcar } ),
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
	railcar?: Record< string, unknown > | undefined,
	additionalProps: Record< string, unknown > = {},
	pathnameOverride?: string
) {
	const source =
		( additionalProps.follow_source as string ) ??
		getLocation( window.location.pathname + window.location.search );
	bumpStat( 'reader_follows', source );
	recordAction( 'followed_blog' );
	recordGaEvent( 'Clicked Follow Blog', source );
	recordTrack(
		'calypso_reader_site_followed',
		{
			url,
			source,
			...additionalProps,
		},
		{
			pathnameOverride,
		}
	);
	if ( railcar ) {
		recordTracksRailcarInteract( 'site_followed', railcar );
	}
}

export function recordUnfollow(
	url: string,
	railcar?: Record< string, unknown >,
	additionalProps: Record< string, unknown > = {},
	pathnameOverride?: string
) {
	const source =
		( additionalProps.follow_source as string ) ??
		getLocation( pathnameOverride || window.location.pathname + window.location.search );
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
