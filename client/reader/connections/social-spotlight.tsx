import {
	getFediverseTimeline,
	getMastodonTimeline,
	getTimeline as getAtmosphereTimeline,
	type AtmosphereFeedItem,
	type FediverseFeedItem,
	type MastodonFeedItem,
} from '@automattic/api-core';
import { useQueries } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useRef } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { getThreadUrl as getAtmosphereThreadUrl } from 'calypso/reader/atmosphere/route';
import { getThreadUrl as getMastodonThreadUrl } from 'calypso/reader/mastodon/route';
import {
	getProtocolIcon,
	getProtocolLabel,
	type ConnectionProtocol,
} from 'calypso/reader/sidebar/reader-sidebar-connections/types';
import { mapAtmosphereFeedItemToSocialPost } from 'calypso/reader/social/mappers/atmosphere';
import { mapFediverseFeedItemToSocialPost } from 'calypso/reader/social/mappers/fediverse';
import { mapMastodonFeedItemToSocialPost } from 'calypso/reader/social/mappers/mastodon';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { SocialSpotlightSkeleton } from './social-spotlight-skeleton';
import type { SocialPost } from 'calypso/reader/social/types';

/**
 * Per-protocol Spotlight input. Discriminated on `protocol` so Mastodon
 * carries its required home instance and Fediverse carries its host —
 * both at compile time, removing the runtime skip-arms below.
 */
export type SpotlightConnection =
	| { protocol: 'atmosphere'; id: number }
	| { protocol: 'mastodon'; id: number; instance: string }
	| { protocol: 'fediverse'; id: number; host: string };

interface Props {
	connections: SpotlightConnection[];
}

/**
 * Items rendered in the strip. Wraps a normalised SocialPost with the
 * protocol and connection-id needed to build a click destination back
 * into the user's own connection (rather than the original poster's).
 */
interface SpotlightItem {
	key: string;
	protocol: ConnectionProtocol;
	connectionId: number;
	post: SocialPost;
	score: number;
	href: string;
}

const SPOTLIGHT_LIMIT = 4;
const MAX_SNIPPET_CHARS = 140;

function scoreFor( post: SocialPost ): number {
	// Likes count once, reposts count twice — a repost is a stronger signal
	// than a like (the user actively re-shared it to their followers).
	// Replies and quotes are noisier (some replies are negative) so they
	// don't factor in for slice 1.
	return ( post.counts?.likes ?? 0 ) + ( post.counts?.reposts ?? 0 ) * 2;
}

function snippet( text: string ): string {
	const flat = text.replace( /\s+/g, ' ' ).trim();
	if ( flat.length <= MAX_SNIPPET_CHARS ) {
		return flat;
	}
	return flat.slice( 0, MAX_SNIPPET_CHARS - 1 ).trimEnd() + '…';
}

function spotlightHrefFor(
	protocol: ConnectionProtocol,
	connectionId: number,
	post: SocialPost
): string {
	if ( protocol === 'atmosphere' ) {
		return getAtmosphereThreadUrl( connectionId, post.uri ) ?? post.permalink;
	}
	if ( protocol === 'mastodon' ) {
		return getMastodonThreadUrl( connectionId, post.uri ) ?? post.permalink;
	}
	// Fediverse doesn't have an in-app thread route today — link out.
	return post.permalink;
}

export function SocialSpotlight( { connections }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	// One first-page fetch per connection, run in parallel. The cache key
	// is intentionally distinct from the infinite-query key — the infinite
	// query stores its first page under a different shape (`{ pages: [],
	// pageParams: [] }`) so we can't share cache cleanly. The Spotlight
	// is small enough that re-fetching here is fine; a future iteration
	// could share by reading the infinite cache directly through
	// `queryClient.getQueryData`.
	//
	// Fetch once per visit and don't refresh in the background. A late
	// refetch on window focus would reshuffle the keyed `<li>` list (the
	// sort is score-derived from like/repost counts) and reconcile through
	// `insertBefore`, which fails with a `DOMException` when something
	// outside React — translation extensions, password managers, dark-mode
	// injectors — has wrapped any of the post text nodes. The strip is a
	// discovery hook, not a live feed, so freezing it sidesteps the entire
	// class of mid-life reorder failures.
	const queries = useQueries( {
		queries: connections.map( ( connection ) => ( {
			queryKey: [ 'reader', 'social-spotlight', connection.protocol, connection.id ],
			queryFn: () => {
				if ( connection.protocol === 'atmosphere' ) {
					return getAtmosphereTimeline( { connectionId: connection.id } );
				}
				if ( connection.protocol === 'mastodon' ) {
					return getMastodonTimeline( { connectionId: connection.id } );
				}
				return getFediverseTimeline( { connectionId: connection.id } );
			},
			staleTime: Infinity,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			retry: false,
			// Don't block the rest of the overview if one upstream is angry.
		} ) ),
	} );

	// When a per-protocol timeline endpoint errors, the strip silently
	// drops that connection's posts. Without a log, a regression in any
	// of the three upstreams is invisible until somebody notices the
	// strip never appears. Track which queries we've already logged for
	// this session so a re-render or refetch loop doesn't spam logstash.
	const loggedErrorKeys = useRef< Set< string > >( new Set() );
	useEffect( () => {
		queries.forEach( ( query, index ) => {
			if ( ! query.isError ) {
				return;
			}
			const connection = connections[ index ];
			const key = `${ connection.protocol }-${ connection.id }`;
			if ( loggedErrorKeys.current.has( key ) ) {
				return;
			}
			loggedErrorKeys.current.add( key );
			logToLogstash( {
				feature: 'calypso_client',
				message: 'Reader Social Spotlight: timeline fetch failed',
				severity: 'warning',
				extra: {
					type: 'reader_social_spotlight_fetch_failed',
					protocol: connection.protocol,
					connection_id: connection.id,
					error:
						query.error instanceof Error ? query.error.message : String( query.error ?? 'unknown' ),
				},
			} );
		} );
	}, [ queries, connections ] );

	// `useQueries` returns a freshly-constructed array on each render even
	// when no underlying state changed, so memoing on `queries` directly
	// would re-run this body every render — including the per-item mapper
	// and the logstash log-on-failure side-effect inside it. Key the memo
	// on `dataUpdatedAt` instead: it only advances when a query delivers
	// a new payload, which is exactly when we want to recompute.
	const dataSignature = queries
		.map( ( q, index ) => {
			const connection = connections[ index ];
			return `${ connection.protocol }-${ connection.id }-${ q.dataUpdatedAt ?? 0 }`;
		} )
		.join( '|' );

	const items = useMemo( () => {
		const all: SpotlightItem[] = [];
		queries.forEach( ( query, index ) => {
			const connection = connections[ index ];
			const page = query.data;
			if ( ! page?.items?.length ) {
				return;
			}
			for ( const raw of page.items ) {
				let post: SocialPost | null = null;
				try {
					if ( connection.protocol === 'atmosphere' ) {
						post = mapAtmosphereFeedItemToSocialPost( raw as AtmosphereFeedItem );
					} else if ( connection.protocol === 'mastodon' ) {
						post = mapMastodonFeedItemToSocialPost( raw as MastodonFeedItem, {
							instance: connection.instance,
						} );
					} else {
						post = mapFediverseFeedItemToSocialPost( raw as FediverseFeedItem, {
							host: connection.host,
						} );
					}
				} catch ( error ) {
					// A single bad item shouldn't break the strip — but log
					// the failure so a regression in a mapper or in the wire
					// shape doesn't go silently unnoticed.
					logToLogstash( {
						feature: 'calypso_client',
						message: 'Reader Social Spotlight: mapper failed',
						severity: 'warning',
						extra: {
							type: 'reader_social_spotlight_map_failed',
							protocol: connection.protocol,
							connection_id: connection.id,
							error: error instanceof Error ? error.message : String( error ),
						},
					} );
					continue;
				}
				if ( ! post ) {
					continue;
				}
				all.push( {
					key: `${ connection.protocol }-${ connection.id }-${ post.uri }`,
					protocol: connection.protocol,
					connectionId: connection.id,
					post,
					score: scoreFor( post ),
					href: spotlightHrefFor( connection.protocol, connection.id, post ),
				} );
			}
		} );
		return all
			.filter( ( item ) => item.score > 0 )
			.sort( ( a, b ) => b.score - a.score )
			.slice( 0, SPOTLIGHT_LIMIT );
		// `dataSignature` is the stable shadow of `queries` and `connections` —
		// see the comment above its declaration.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ dataSignature ] );

	const isLoading = queries.some( ( q ) => q.isPending );

	// While first pages load, render a layout-stable skeleton so the
	// accounts grid below doesn't shift down when items resolve. In the
	// steady state with no scoreable posts the strip is opt-in noise, so
	// the section still collapses to null once loading completes.
	if ( isLoading ) {
		return <SocialSpotlightSkeleton />;
	}
	if ( items.length === 0 ) {
		return null;
	}

	const handleClick = ( item: SpotlightItem ) => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_social_spotlight_clicked', {
				protocol: item.protocol,
				connection_id: item.connectionId,
				score: item.score,
			} )
		);
	};

	return (
		<section className="social-spotlight" aria-labelledby="social-spotlight-heading">
			<header className="social-spotlight__header">
				<h2 id="social-spotlight-heading" className="social-spotlight__title">
					{ translate( 'What’s hot' ) }
				</h2>
				<p className="social-spotlight__subtitle">
					{ translate( 'The most-reacted-to posts across your connected networks right now.' ) }
				</p>
			</header>
			<ul className="social-spotlight__list">
				{ items.map( ( item ) => {
					const author = item.post.author;
					const avatar = author.avatar;
					return (
						<li
							key={ item.key }
							className={ `social-spotlight__card social-spotlight__card--${ item.protocol }` }
						>
							<a
								className="social-spotlight__link"
								href={ item.href }
								onClick={ () => handleClick( item ) }
							>
								<header className="social-spotlight__card-header">
									{ avatar ? (
										<img
											className="social-spotlight__card-avatar"
											src={ avatar }
											alt=""
											width={ 32 }
											height={ 32 }
											loading="lazy"
											decoding="async"
										/>
									) : (
										<div className="social-spotlight__card-avatar social-spotlight__card-avatar--placeholder" />
									) }
									<div className="social-spotlight__card-author">
										<div className="social-spotlight__card-author-name">
											{ author.display_name || author.handle }
										</div>
										<div className="social-spotlight__card-author-handle">
											{ author.handle.startsWith( '@' ) ? author.handle : `@${ author.handle }` }
										</div>
									</div>
									<span
										className={ `social-spotlight__badge social-spotlight__badge--${ item.protocol }` }
										aria-label={ getProtocolLabel( item.protocol ) }
									>
										{ getProtocolIcon( item.protocol ) }
									</span>
								</header>
								<p className="social-spotlight__card-text">{ snippet( item.post.text ) }</p>
								<footer className="social-spotlight__card-counts">
									<span>
										<span aria-hidden="true">♡ { item.post.counts?.likes ?? 0 }</span>
										<span className="screen-reader-text">
											{ translate( '%(count)d like', '%(count)d likes', {
												count: item.post.counts?.likes ?? 0,
												args: { count: item.post.counts?.likes ?? 0 },
											} ) }
										</span>
									</span>
									<span>
										<span aria-hidden="true">↻ { item.post.counts?.reposts ?? 0 }</span>
										<span className="screen-reader-text">
											{ translate( '%(count)d repost', '%(count)d reposts', {
												count: item.post.counts?.reposts ?? 0,
												args: { count: item.post.counts?.reposts ?? 0 },
											} ) }
										</span>
									</span>
								</footer>
							</a>
						</li>
					);
				} ) }
			</ul>
		</section>
	);
}
