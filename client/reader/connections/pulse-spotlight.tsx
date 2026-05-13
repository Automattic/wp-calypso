import {
	getFediverseTimeline,
	getMastodonTimeline,
	getTimeline as getAtmosphereTimeline,
} from '@automattic/api-core';
import { useQueries } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
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
import type { SocialPost } from 'calypso/reader/social/types';

export interface SpotlightConnection {
	protocol: ConnectionProtocol;
	id: number;
	/**
	 * Required for Mastodon connections. The home instance host
	 * (e.g. `mastodon.social`) used to qualify local-account handles
	 * inside the Mastodon mapper.
	 */
	instance?: string;
	/**
	 * Required for Fediverse connections. The blog host
	 * (e.g. `myblog.wordpress.com`) used by the Fediverse mapper.
	 */
	host?: string;
}

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

const SPOTLIGHT_LIMIT = 3;
const STALE_TIME_MS = 60_000;
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

export function PulseSpotlight( { connections }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	// One first-page fetch per connection, run in parallel. The cache key
	// is intentionally distinct from the infinite-query key — the infinite
	// query stores its first page under a different shape (`{ pages: [],
	// pageParams: [] }`) so we can't share cache cleanly. The Spotlight
	// is small enough that re-fetching here is fine; a future iteration
	// could share by reading the infinite cache directly through
	// `queryClient.getQueryData`.
	const queries = useQueries( {
		queries: connections.map( ( connection ) => ( {
			queryKey: [ 'reader', 'pulse-spotlight', connection.protocol, connection.id ],
			queryFn: () => {
				if ( connection.protocol === 'atmosphere' ) {
					return getAtmosphereTimeline( { connectionId: connection.id } );
				}
				if ( connection.protocol === 'mastodon' ) {
					return getMastodonTimeline( { connectionId: connection.id } );
				}
				return getFediverseTimeline( { connectionId: connection.id } );
			},
			staleTime: STALE_TIME_MS,
			retry: false,
			// Don't block the rest of the overview if one upstream is angry.
		} ) ),
	} );

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
						post = mapAtmosphereFeedItemToSocialPost(
							raw as Parameters< typeof mapAtmosphereFeedItemToSocialPost >[ 0 ]
						);
					} else if ( connection.protocol === 'mastodon' ) {
						if ( ! connection.instance ) {
							continue;
						}
						post = mapMastodonFeedItemToSocialPost(
							raw as Parameters< typeof mapMastodonFeedItemToSocialPost >[ 0 ],
							{ instance: connection.instance }
						);
					} else {
						if ( ! connection.host ) {
							continue;
						}
						post = mapFediverseFeedItemToSocialPost(
							raw as Parameters< typeof mapFediverseFeedItemToSocialPost >[ 0 ],
							{ host: connection.host }
						);
					}
				} catch {
					// A single bad item shouldn't break the strip. Skip it.
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
	}, [ queries, connections ] );

	const isLoading = queries.some( ( q ) => q.isPending );

	// While first pages are still loading, render nothing — the Pulse
	// overview's own spinner already covers the slow case, and a flash of
	// "no posts yet" before items resolve would read as broken.
	if ( isLoading || items.length === 0 ) {
		return null;
	}

	const handleClick = ( item: SpotlightItem ) => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_pulse_spotlight_clicked', {
				protocol: item.protocol,
				connection_id: item.connectionId,
				score: item.score,
			} )
		);
	};

	return (
		<section className="pulse-spotlight" aria-labelledby="pulse-spotlight-heading">
			<header className="pulse-spotlight__header">
				<h2 id="pulse-spotlight-heading" className="pulse-spotlight__title">
					{ translate( 'What’s hot' ) }
				</h2>
				<p className="pulse-spotlight__subtitle">
					{ translate( 'The most-reacted-to posts across your connected networks right now.' ) }
				</p>
			</header>
			<ul className="pulse-spotlight__list">
				{ items.map( ( item ) => {
					const author = item.post.author;
					const avatar = author.avatar;
					return (
						<li
							key={ item.key }
							className={ `pulse-spotlight__card pulse-spotlight__card--${ item.protocol }` }
						>
							<a
								className="pulse-spotlight__link"
								href={ item.href }
								onClick={ () => handleClick( item ) }
							>
								<header className="pulse-spotlight__card-header">
									{ avatar ? (
										<img
											className="pulse-spotlight__card-avatar"
											src={ avatar }
											alt=""
											width={ 32 }
											height={ 32 }
											loading="lazy"
											decoding="async"
										/>
									) : (
										<div className="pulse-spotlight__card-avatar pulse-spotlight__card-avatar--placeholder" />
									) }
									<div className="pulse-spotlight__card-author">
										<div className="pulse-spotlight__card-author-name">
											{ author.display_name || author.handle }
										</div>
										<div className="pulse-spotlight__card-author-handle">
											{ author.handle.startsWith( '@' ) ? author.handle : `@${ author.handle }` }
										</div>
									</div>
									<span
										className={ `pulse-spotlight__badge pulse-spotlight__badge--${ item.protocol }` }
										aria-label={ getProtocolLabel( item.protocol ) }
									>
										{ getProtocolIcon( item.protocol ) }
									</span>
								</header>
								<p className="pulse-spotlight__card-text">{ snippet( item.post.text ) }</p>
								<footer className="pulse-spotlight__card-counts">
									<span aria-label={ String( translate( 'Likes' ) ) }>
										♡ { item.post.counts?.likes ?? 0 }
									</span>
									<span aria-label={ String( translate( 'Reposts' ) ) }>
										↻ { item.post.counts?.reposts ?? 0 }
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
