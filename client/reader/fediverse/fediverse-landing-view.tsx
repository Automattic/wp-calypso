import { useFediverseConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Button, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import ReaderMain from 'calypso/reader/components/reader-main';
import { TIMELINE_TAB } from './helper';

/**
 * Redirect-on-load landing view. Mirrors `MastodonLandingView`:
 * when connections resolve, jump straight to the first account's
 * `/timeline` tab. The sidebar lists every connection, so account
 * switching happens there — there's no need for a separate chooser
 * page. With no connections an empty state stays put (the Fediverse
 * surface has no user-driven OAuth flow to bounce to).
 */
export function FediverseLandingView() {
	const translate = useTranslate();
	const { data, isPending, isError, refetch } = useFediverseConnectionsQuery();

	useEffect( () => {
		if ( isPending || isError || ! data ) {
			return;
		}
		const first = data.connections[ 0 ];
		if ( first ) {
			page.replace( `/reader/fediverse/${ first.id }/${ TIMELINE_TAB }` );
		}
	}, [ isPending, data, isError ] );

	const hasConnections = ! isPending && ! isError && ( data?.connections.length ?? 0 ) > 0;

	return (
		<ReaderMain className="fediverse-view">
			<DocumentHead title={ translate( 'Fediverse ‹ Reader' ) } />
			{ isError && (
				<div role="alert" className="fediverse-error">
					<p>{ translate( 'We couldn’t load your Fediverse accounts.' ) }</p>
					<Button variant="secondary" onClick={ () => refetch() }>
						{ translate( 'Try again' ) }
					</Button>
				</div>
			) }
			{ ! isError && ! hasConnections && ! isPending && (
				<EmptyContent
					title={ String( translate( 'No Fediverse accounts yet' ) ) }
					line={ String(
						translate( 'Enable the ActivityPub plugin on a WordPress site you own to see it here.' )
					) }
				/>
			) }
			{ ! isError && ( isPending || hasConnections ) && (
				<div className="wp-spinner-wrapper" role="status" aria-live="polite">
					<Spinner />
					<p>{ translate( 'Loading…' ) }</p>
				</div>
			) }
		</ReaderMain>
	);
}

export default FediverseLandingView;
