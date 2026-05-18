import {
	useConnectionQuery,
	useConnectionsQuery,
	useFediverseConnectionsQuery,
	useMastodonConnectionQuery,
	useMastodonConnectionsQuery,
} from '@automattic/api-queries';
import { Card, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import { DEFAULT_ATMOSPHERE_TAB } from 'calypso/reader/atmosphere/helper';
import ReaderMain from 'calypso/reader/components/reader-main';
import { DEFAULT_FEDIVERSE_TAB } from 'calypso/reader/fediverse/helper';
import { DEFAULT_MASTODON_TAB } from 'calypso/reader/mastodon/helper';
import {
	getProtocolIcon,
	getProtocolLabel,
	type ConnectionProtocol,
} from 'calypso/reader/sidebar/reader-sidebar-connections/types';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { SocialSpotlight, type SpotlightConnection } from './social-spotlight';
import type {
	AtmosphereConnection,
	FediverseConnection,
	MastodonConnection,
} from '@automattic/api-core';

interface SocialCard {
	protocol: ConnectionProtocol;
	id: number;
	displayName: string;
	handle: string;
	avatarUrl: string | null;
	href: string;
	/** Mastodon-only: home instance host. */
	instance?: string;
	/** Fediverse-only: blog host derived from webfinger. */
	host?: string;
}

function mapAtmosphere( c: AtmosphereConnection ): SocialCard {
	return {
		protocol: 'atmosphere',
		id: c.id,
		displayName: c.display_name || c.handle,
		handle: `@${ c.handle }`,
		avatarUrl: c.avatar ?? null,
		href: `/reader/atmosphere/${ c.id }/${ DEFAULT_ATMOSPHERE_TAB }`,
	};
}

function mapMastodon( c: MastodonConnection ): SocialCard {
	return {
		protocol: 'mastodon',
		id: c.id,
		displayName: c.display_name || c.handle,
		handle: c.handle,
		avatarUrl: c.avatar ?? null,
		href: `/reader/mastodon/${ c.id }/${ DEFAULT_MASTODON_TAB }`,
		instance: c.instance,
	};
}

/**
 * Strip a leading `@` and the leading user segment from a webfinger
 * handle like `@user@host` (or `user@host`) to surface the host portion
 * the Fediverse mapper expects.
 */
function hostFromWebfinger( webfinger: string ): string {
	const trimmed = webfinger.replace( /^@/, '' );
	const at = trimmed.indexOf( '@' );
	return at === -1 ? trimmed : trimmed.slice( at + 1 );
}

function mapFediverse( c: FediverseConnection ): SocialCard {
	return {
		protocol: 'fediverse',
		id: c.id,
		displayName: c.name || c.webfinger,
		handle: c.webfinger,
		avatarUrl: c.icon || null,
		href: `/reader/fediverse/${ c.id }/${ DEFAULT_FEDIVERSE_TAB }`,
		host: hostFromWebfinger( c.webfinger ),
	};
}

/**
 * Single card. Mirrors the per-id lazy fetch pattern from the sidebar
 * rows: Mastodon and ATmosphere list endpoints return null avatar and
 * empty display_name, so we hydrate from the per-id query. Fediverse
 * carries the icon on the list endpoint already.
 */
function SocialCardItem( { card, onClick }: { card: SocialCard; onClick: () => void } ) {
	const atmosphereId = card.protocol === 'atmosphere' ? card.id : null;
	const mastodonId = card.protocol === 'mastodon' ? card.id : null;
	const atmosphere = useConnectionQuery( atmosphereId );
	const mastodon = useMastodonConnectionQuery( mastodonId );

	let avatarUrl = card.avatarUrl;
	let displayName = card.displayName;
	if ( card.protocol === 'atmosphere' ) {
		avatarUrl = atmosphere.data?.avatar ?? avatarUrl;
		displayName = atmosphere.data?.display_name || displayName;
	} else if ( card.protocol === 'mastodon' ) {
		avatarUrl = mastodon.data?.avatar ?? avatarUrl;
		displayName = mastodon.data?.display_name || displayName;
	}

	return (
		<a
			className={ `social-card social-card--${ card.protocol }` }
			href={ card.href }
			onClick={ onClick }
		>
			<div className="social-card__avatar-wrap">
				{ avatarUrl ? (
					<img
						className="social-card__avatar"
						src={ avatarUrl }
						alt=""
						width={ 56 }
						height={ 56 }
						loading="lazy"
						decoding="async"
					/>
				) : (
					<div className="social-card__avatar social-card__avatar--placeholder" />
				) }
				<span
					className={ `social-card__badge social-card__badge--${ card.protocol }` }
					aria-hidden="true"
				>
					{ getProtocolIcon( card.protocol ) }
				</span>
			</div>
			<div className="social-card__body">
				<div className="social-card__name">{ displayName }</div>
				<div className="social-card__handle">{ card.handle }</div>
				<div className="social-card__protocol">{ getProtocolLabel( card.protocol ) }</div>
			</div>
		</a>
	);
}

/**
 * "Social" overview surface — a grid of cards, one per connected social
 * account across every protocol. The home page for the unified
 * `/reader/connections` section; each card is a shortcut into its
 * respective timeline.
 */
export function SocialOverviewView() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const atmosphere = useConnectionsQuery();
	const mastodon = useMastodonConnectionsQuery();
	const fediverse = useFediverseConnectionsQuery();

	const isLoading = atmosphere.isPending || mastodon.isPending || fediverse.isPending;
	const hasAllErrored = atmosphere.isError && mastodon.isError && fediverse.isError;

	const cards: SocialCard[] = useMemo(
		() => [
			...( atmosphere.data?.connections ?? [] ).map( mapAtmosphere ),
			...( mastodon.data?.connections ?? [] ).map( mapMastodon ),
			...( fediverse.data?.connections ?? [] ).map( mapFediverse ),
		],
		[ atmosphere.data, mastodon.data, fediverse.data ]
	);

	// Flat protocol+id (+instance/host) list for the Spotlight strip.
	// Memoised so a reference-stable array reaches `useQueries` inside
	// the Spotlight, avoiding a refetch storm on every overview re-render.
	const spotlightConnections = useMemo< SpotlightConnection[] >( () => {
		const result: SpotlightConnection[] = [];
		for ( const card of cards ) {
			if ( card.protocol === 'atmosphere' ) {
				result.push( { protocol: 'atmosphere', id: card.id } );
			} else if ( card.protocol === 'mastodon' ) {
				if ( card.instance ) {
					result.push( { protocol: 'mastodon', id: card.id, instance: card.instance } );
				}
			} else if ( card.host ) {
				result.push( { protocol: 'fediverse', id: card.id, host: card.host } );
			}
		}
		return result;
	}, [ cards ] );
	const showSpotlight = ! isLoading && spotlightConnections.length > 0;

	const handleCardClick = ( card: SocialCard ) => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_social_card_clicked', {
				protocol: card.protocol,
				connection_id: card.id,
			} )
		);
	};

	return (
		<ReaderMain className="social-view">
			<DocumentHead title={ translate( 'Social ‹ Reader' ) } />
			<NavigationHeader
				title={ translate( 'Social' ) }
				subtitle={ translate(
					'Everything you’ve plugged into the Reader, in one place. Pick a network to dive in.'
				) }
			/>

			{ isLoading && (
				<div className="wp-spinner-wrapper" role="status" aria-live="polite">
					<Spinner />
					<p>{ translate( 'Loading…' ) }</p>
				</div>
			) }

			{ ! isLoading && hasAllErrored && (
				<Card className="social-empty" elevation={ 0 }>
					<h2>{ translate( "We couldn't load your social accounts" ) }</h2>
					<p>
						{ translate(
							'Something went wrong while checking your connections. Please refresh to try again.'
						) }
					</p>
				</Card>
			) }

			{ ! isLoading && ! hasAllErrored && cards.length === 0 && (
				<Card className="social-empty" elevation={ 0 }>
					<h2>{ translate( 'Nothing here yet' ) }</h2>
					<p>
						{ translate(
							'You haven’t connected any social accounts yet. Start with the network you already know best, or let your WordPress site do the work for you.'
						) }
					</p>
					<a className="social-empty__cta" href="/reader/connections/new">
						{ translate( 'Pick a network →' ) }
					</a>
				</Card>
			) }

			{ showSpotlight && <SocialSpotlight connections={ spotlightConnections } /> }

			{ ! isLoading && cards.length > 0 && (
				<div className="social-grid">
					{ cards.map( ( card ) => (
						<SocialCardItem
							key={ `${ card.protocol }-${ card.id }` }
							card={ card }
							onClick={ () => handleCardClick( card ) }
						/>
					) ) }
					<a className="social-card social-card--add" href="/reader/connections/new">
						<div className="social-card__plus" aria-hidden="true">
							+
						</div>
						<div className="social-card__body">
							<div className="social-card__name">{ translate( 'Add another' ) }</div>
							<div className="social-card__handle">
								{ translate( 'Bluesky, Mastodon, or your own site' ) }
							</div>
						</div>
					</a>
				</div>
			) }
		</ReaderMain>
	);
}

export default SocialOverviewView;
