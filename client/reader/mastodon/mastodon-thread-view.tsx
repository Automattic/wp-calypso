import { useMastodonConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import { ComposeFab, ComposerModal, ComposerProvider } from 'calypso/reader/social/composer';
import { mastodonComposerConfig } from './composer-config';
import { ThreadPanel } from './thread-panel';
import { MastodonReauthGate, useMastodonReauthGateState } from './use-mastodon-reauth-gate';

interface Props {
	connectionId: number;
	statusId: string;
}

export function MastodonThreadView( { connectionId, statusId }: Props ) {
	const translate = useTranslate();
	const { data, isPending, isError, refetch } = useMastodonConnectionsQuery();

	const connections = data?.connections ?? [];
	const connection = connections.find( ( c ) => c.id === connectionId ) ?? null;

	// The compose FAB and modal sit outside <ConnectionReauthGate>, so without
	// an explicit guard they'd float over the reauth prompt. Hide both while
	// the connection needs reauth — any post submitted via that path would
	// fail with auth_required anyway.
	const { needsReauth } = useMastodonReauthGateState( connection?.id ?? null );

	useEffect( () => {
		if ( isPending || isError ) {
			return;
		}
		if ( ! connection ) {
			page.replace( '/reader/mastodon' );
		}
	}, [ isPending, isError, connection, connectionId ] );

	if ( isError ) {
		return (
			<ReaderMain className="mastodon-view">
				<DocumentHead title={ translate( 'Thread ‹ Mastodon ‹ Reader' ) } />
				<div role="alert" className="mastodon-error">
					<p>{ translate( "We couldn't load your Mastodon connections." ) }</p>
					<Button variant="secondary" onClick={ () => refetch() }>
						{ translate( 'Try again' ) }
					</Button>
				</div>
			</ReaderMain>
		);
	}

	if ( ! connection ) {
		return (
			<ReaderMain className="mastodon-view">
				<DocumentHead title={ translate( 'Thread ‹ Mastodon ‹ Reader' ) } />
				<div role="status" aria-live="polite">
					{ translate( 'Loading…' ) }
				</div>
			</ReaderMain>
		);
	}

	return (
		<ComposerProvider connectionId={ connection.id } config={ mastodonComposerConfig }>
			<ReaderMain className="mastodon-view">
				<DocumentHead
					title={ translate( '%s ‹ Mastodon ‹ Reader', { args: connection.handle } ) }
				/>
				<MastodonReauthGate connection={ connection }>
					<ThreadPanel connection={ connection } statusId={ statusId } />
				</MastodonReauthGate>
			</ReaderMain>
			{ ! needsReauth && (
				<>
					<ComposeFab />
					<ComposerModal />
				</>
			) }
		</ComposerProvider>
	);
}

export default MastodonThreadView;
