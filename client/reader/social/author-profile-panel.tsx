import { __experimentalVStack as VStack } from '@wordpress/components';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { AuthorProfileHeader } from './author-profile-header';
import { SocialFeedList } from './components/feed-list';
import { SocialPostCard } from './components/post-card';
import { SocialAnalyticsProvider } from './components/post-card/analytics-context';
import { SocialProfileHeaderSkeleton } from './profile-header-skeleton';
import type { SocialError, SocialPost } from './types';
import type { AppState } from 'calypso/types';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode } from 'react';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

interface ProtocolError {
	kind: string;
}

interface QueryState< TData, TError > {
	data: TData | undefined;
	isPending: boolean;
	isError: boolean;
	error: TError | null;
	refetch: () => void;
}

interface InfiniteQueryState< TItem, TError > {
	data: { pages: Array< { items: TItem[]; cursor: string | null } > } | undefined;
	isPending: boolean;
	isError: boolean;
	error: TError | null;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: () => void;
	refetch: () => void;
}

export interface SocialAuthorProfilePanelProps<
	TProfile,
	TError extends ProtocolError,
	TFeedItem,
> {
	connectionId: number;
	actor: string;
	timelineUrl: string;
	// Identifies the protocol on the analytics provider value (consumed by
	// shared post-card subcomponents).
	source: string;
	// Tracks event prefix (e.g. `calypso_reader_atmosphere_` or
	// `calypso_reader_mastodon_`). The shared panel appends `profile_viewed`
	// etc. and rewrites `${prefix}timeline_*` to `${prefix}profile_*` for
	// click events bubbling from post-card subcomponents.
	tracksProtocolPrefix: string;

	// Already-fetched query results — wrappers call protocol-specific hooks
	// and pass results in. Decouples the shared layout from the per-protocol
	// hook signatures.
	profile: QueryState< TProfile, TError >;
	feed: InfiniteQueryState< TFeedItem, TError >;

	// Tracks props payload merged into the `${prefix}profile_viewed` event
	// once `profile.data` resolves. Atmosphere supplies `actor_did` +
	// `actor_handle`; Mastodon supplies `actor_id` + `actor_handle` so
	// dashboards can split DID-URL vs id-URL views.
	getProfileViewedProps: ( profile: TProfile ) => Record< string, unknown >;

	// Profile-header render slots. Wrappers own protocol-specific copy and
	// rendering of the EmptyContent / SocialProfileCard.
	renderProfileBody: ( profile: TProfile ) => ReactNode;
	renderProfileError: ( error: TError, retry: () => void ) => ReactNode;
	// Optional pending-state slot. Wrappers can pass a protocol-styled
	// skeleton; default is the layout-stable SocialProfileHeaderSkeleton so
	// the surface doesn't shift when profile data resolves.
	renderProfileLoading?: () => ReactNode;

	// Feed items: wrappers provide a stable dedup key (atmosphere uses
	// `post.uri`, Mastodon uses `post.id`) and a feed-item → SocialPost
	// mapper. The shared panel dedupes within a render pass before mapping.
	feedItemKey: ( item: TFeedItem ) => string | undefined;
	mapFeedItem: ( item: TFeedItem ) => SocialPost;

	projectFeedError: ( error: TError | null | undefined ) => SocialError | null;

	// URL builders bound on the SocialAnalyticsProvider value so post-card
	// subcomponents can re-target click destinations in-app.
	buildProfileUrl: ( ref: {
		id?: string | null;
		did?: string | null;
		handle?: string | null;
	} ) => string | null;
	buildThreadUrl: ( postUri: string ) => string | null;
	// Slice-8 hashtag resolver. Optional: protocols without a hashtag
	// concept (atmosphere) leave it unset and `<PostCardBody>` falls
	// back to the anchor's external href.
	buildTagUrl?: ( tag: string ) => string | null;

	// Composer action handlers forwarded to the analytics context so the
	// reply / quote buttons on post-cards work from within the profile feed.
	// Both are optional — surfaces without a mounted composer omit them and
	// the buttons stay in their static (unsupported) state.
	onReplyClick?: ( post: SocialPost ) => void;
	onQuoteClick?: ( post: SocialPost ) => void;

	// Empty / error vocabulary for the SocialFeedList. Wrappers compute
	// these (e.g. Mastodon swaps in a locked-account variant when the
	// profile is locked and the feed is empty).
	emptyTitle: string;
	emptyLine: string;
	emptyActionLabel?: string;
	emptyActionURL?: string;
	protocolLabel: string;
	protocolHomeURL: string;
	protocolHomeLabel: TranslateResult;

	// Wrapper-specific class on the VStack (allows protocol-scoped CSS).
	className?: string;

	// Wrapper-supplied dimension (e.g. the active filter slug). When this
	// value changes, the panel resets its feed-surface `error_shown` dedup
	// so each dimension's first error fires its own analytics event even
	// when the kind matches the prior dimension.
	feedDimension?: string;
}

// Shared author-profile surface used by every protocol shell. Owns the
// layout (back button + profile header + feed list), Tracks event firing
// (with ref-based dedupe per surface and per (connection, actor) tuple),
// and the analytics provider value. Per-protocol shells inject the data
// hooks, mappers, error projectors, URL builders, and copy.
export function SocialAuthorProfilePanel< TProfile, TError extends ProtocolError, TFeedItem >( {
	connectionId,
	actor,
	timelineUrl,
	source,
	tracksProtocolPrefix,
	profile,
	feed,
	getProfileViewedProps,
	renderProfileBody,
	renderProfileError,
	renderProfileLoading,
	feedItemKey,
	mapFeedItem,
	projectFeedError,
	buildProfileUrl,
	buildThreadUrl,
	buildTagUrl,
	onReplyClick,
	onQuoteClick,
	emptyTitle,
	emptyLine,
	emptyActionLabel,
	emptyActionURL,
	protocolLabel,
	protocolHomeURL,
	protocolHomeLabel,
	className,
	feedDimension,
}: SocialAuthorProfilePanelProps< TProfile, TError, TFeedItem > ) {
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const lastErrorKind = useRef< { header: string | null; feed: string | null } >( {
		header: null,
		feed: null,
	} );

	// Reset error_shown dedup when navigating between profiles so the next
	// author's first error fires its analytics even when the kind matches.
	useEffect( () => {
		lastErrorKind.current = { header: null, feed: null };
	}, [ actor, connectionId ] );

	// Per-dimension feed errors must each fire their own _error_shown
	// (e.g. rate_limited on Posts then again on Replies). Reset only the
	// feed-side dedup so the header-surface dedup is unaffected.
	useEffect( () => {
		if ( feedDimension === undefined ) {
			return;
		}
		lastErrorKind.current.feed = null;
	}, [ feedDimension ] );

	// Fire profile_viewed exactly once per (actor, connection) — gated on
	// resolved profile data so the Tracks payload carries identifiers.
	const viewedFor = useRef< string | null >( null );
	useEffect( () => {
		const key = `${ connectionId }:${ actor }`;
		if ( viewedFor.current === key || ! profile.data ) {
			return;
		}
		viewedFor.current = key;
		dispatch(
			recordReaderTracksEvent( `${ tracksProtocolPrefix }profile_viewed`, {
				connection_id: connectionId,
				actor,
				...getProfileViewedProps( profile.data ),
			} )
		);
	}, [ actor, connectionId, profile.data, dispatch, tracksProtocolPrefix, getProfileViewedProps ] );

	useEffect( () => {
		if ( profile.isError && profile.error && profile.error.kind !== lastErrorKind.current.header ) {
			lastErrorKind.current.header = profile.error.kind;
			dispatch(
				recordReaderTracksEvent( `${ tracksProtocolPrefix }profile_error_shown`, {
					connection_id: connectionId,
					actor,
					error_kind: profile.error.kind,
					surface: 'header',
				} )
			);
		}
		if ( ! profile.isError ) {
			lastErrorKind.current.header = null;
		}
	}, [ profile.isError, profile.error, connectionId, actor, dispatch, tracksProtocolPrefix ] );

	useEffect( () => {
		if ( feed.isError && feed.error && feed.error.kind !== lastErrorKind.current.feed ) {
			lastErrorKind.current.feed = feed.error.kind;
			dispatch(
				recordReaderTracksEvent( `${ tracksProtocolPrefix }profile_error_shown`, {
					connection_id: connectionId,
					actor,
					error_kind: feed.error.kind,
					surface: 'feed',
				} )
			);
		}
		if ( ! feed.isError ) {
			lastErrorKind.current.feed = null;
		}
	}, [ feed.isError, feed.error, connectionId, actor, dispatch, tracksProtocolPrefix ] );

	const items: SocialPost[] = useMemo( () => {
		const seen = new Set< string >();
		const deduped: TFeedItem[] = [];
		for ( const post of feed.data?.pages.flatMap( ( page ) => page.items ?? [] ) ?? [] ) {
			// Skip null/undefined entries before invoking `feedItemKey` —
			// some upstream payloads include holes; we don't want a single
			// malformed item to crash the whole panel.
			if ( ! post ) {
				continue;
			}
			const key = feedItemKey( post );
			if ( ! key || seen.has( key ) ) {
				continue;
			}
			seen.add( key );
			deduped.push( post );
		}
		return deduped.map( mapFeedItem );
	}, [ feed.data, feedItemKey, mapFeedItem ] );

	const handleHeaderRetry = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( `${ tracksProtocolPrefix }profile_retry_clicked`, {
				connection_id: connectionId,
				actor,
				error_kind: profile.error?.kind ?? 'unknown',
				surface: 'header',
			} )
		);
		profile.refetch();
	}, [ connectionId, actor, profile, dispatch, tracksProtocolPrefix ] );

	const handleFeedRetry = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( `${ tracksProtocolPrefix }profile_retry_clicked`, {
				connection_id: connectionId,
				actor,
				error_kind: feed.error?.kind ?? 'unknown',
				surface: 'feed',
			} )
		);
		feed.refetch();
	}, [ connectionId, actor, feed, dispatch, tracksProtocolPrefix ] );

	const handleBackToTimeline = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( `${ tracksProtocolPrefix }profile_back_to_timeline_clicked`, {
				connection_id: connectionId,
				actor,
			} )
		);
	}, [ connectionId, actor, dispatch, tracksProtocolPrefix ] );

	const onClickAnalytics = useCallback(
		( event: string, props: Record< string, unknown > ) => {
			// Subcomponents emit `${prefix}timeline_*`; rewrite to
			// `${prefix}profile_*` so dashboards can split by surface.
			const TIMELINE_PREFIX = `${ tracksProtocolPrefix }timeline_`;
			const PROFILE_PREFIX = `${ tracksProtocolPrefix }profile_`;
			const reprefixed = event.startsWith( TIMELINE_PREFIX )
				? PROFILE_PREFIX + event.slice( TIMELINE_PREFIX.length )
				: event;
			dispatch( recordReaderTracksEvent( reprefixed, { ...props, actor } ) );
		},
		[ dispatch, actor, tracksProtocolPrefix ]
	);

	const renderItem = useCallback(
		( post: SocialPost ) => <SocialPostCard post={ post } variant="default" />,
		[]
	);
	const itemKey = useCallback( ( post: SocialPost ) => post.uri, [] );

	const analyticsValue = useMemo(
		() => ( {
			source,
			connectionId,
			onClick: onClickAnalytics,
			getThreadUrl: buildThreadUrl,
			getProfileUrl: buildProfileUrl,
			getTagUrl: buildTagUrl,
			onReplyClick,
			onQuoteClick,
		} ),
		[
			source,
			connectionId,
			onClickAnalytics,
			buildThreadUrl,
			buildProfileUrl,
			buildTagUrl,
			onReplyClick,
			onQuoteClick,
		]
	);

	const renderHeader = () => {
		if ( profile.isPending ) {
			return renderProfileLoading ? renderProfileLoading() : <SocialProfileHeaderSkeleton />;
		}
		if ( profile.isError && profile.error ) {
			return renderProfileError( profile.error, handleHeaderRetry );
		}
		if ( profile.data ) {
			return renderProfileBody( profile.data );
		}
		return null;
	};

	return (
		<SocialAnalyticsProvider value={ analyticsValue }>
			<VStack spacing={ 4 } className={ className }>
				<AuthorProfileHeader
					timelineUrl={ timelineUrl }
					onBackToTimeline={ handleBackToTimeline }
				/>
				{ renderHeader() }
				<SocialFeedList< SocialPost >
					items={ items }
					isPending={ feed.isPending }
					isError={ feed.isError }
					error={ projectFeedError( feed.error ) }
					hasNextPage={ Boolean( feed.hasNextPage ) }
					isFetchingNextPage={ feed.isFetchingNextPage }
					fetchNextPage={ feed.fetchNextPage }
					refetch={ handleFeedRetry }
					renderItem={ renderItem }
					itemKey={ itemKey }
					emptyTitle={ emptyTitle }
					emptyLine={ emptyLine }
					emptyActionLabel={ emptyActionLabel }
					emptyActionURL={ emptyActionURL }
					protocolLabel={ protocolLabel }
					protocolHomeURL={ protocolHomeURL }
					protocolHomeLabel={ String( protocolHomeLabel ) }
				/>
			</VStack>
		</SocialAnalyticsProvider>
	);
}
