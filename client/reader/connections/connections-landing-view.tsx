import {
	useConnectionsQuery,
	useFediverseConnectionsQuery,
	useMastodonConnectionsQuery,
} from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { DEFAULT_ATMOSPHERE_TAB } from 'calypso/reader/atmosphere/helper';
import ReaderMain from 'calypso/reader/components/reader-main';
import { DEFAULT_FEDIVERSE_TAB } from 'calypso/reader/fediverse/helper';
import { DEFAULT_MASTODON_TAB } from 'calypso/reader/mastodon/helper';

/**
 * Unified landing route. When at least one connection exists on any
 * protocol, redirect to the first one we find (ATmosphere → Mastodon →
 * Fediverse order, matching the sidebar list ordering). Otherwise, send
 * the user to the chooser at `/reader/connections/new`.
 *
 * All three queries fire in parallel; we wait until none are still
 * loading so a fast empty response from one protocol doesn't bounce us
 * past slower ones that actually have connections.
 */
export function ConnectionsLandingView() {
	const translate = useTranslate();

	const atmosphere = useConnectionsQuery();
	const mastodon = useMastodonConnectionsQuery();
	const fediverse = useFediverseConnectionsQuery();

	const isLoading = atmosphere.isPending || mastodon.isPending || fediverse.isPending;

	useEffect( () => {
		if ( isLoading ) {
			return;
		}

		const firstAtmosphere = atmosphere.data?.connections?.[ 0 ];
		if ( firstAtmosphere ) {
			page.replace( `/reader/atmosphere/${ firstAtmosphere.id }/${ DEFAULT_ATMOSPHERE_TAB }` );
			return;
		}

		const firstMastodon = mastodon.data?.connections?.[ 0 ];
		if ( firstMastodon ) {
			page.replace( `/reader/mastodon/${ firstMastodon.id }/${ DEFAULT_MASTODON_TAB }` );
			return;
		}

		const firstFediverse = fediverse.data?.connections?.[ 0 ];
		if ( firstFediverse ) {
			page.replace( `/reader/fediverse/${ firstFediverse.id }/${ DEFAULT_FEDIVERSE_TAB }` );
			return;
		}

		page.replace( '/reader/connections/new' );
	}, [ isLoading, atmosphere.data, mastodon.data, fediverse.data ] );

	return (
		<ReaderMain className="connections-view">
			<DocumentHead title={ translate( 'Social accounts ‹ Reader' ) } />
			<div className="wp-spinner-wrapper" role="status" aria-live="polite">
				<Spinner />
				<p>{ translate( 'Loading…' ) }</p>
			</div>
		</ReaderMain>
	);
}

export default ConnectionsLandingView;
