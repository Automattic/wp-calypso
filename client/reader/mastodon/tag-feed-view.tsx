import { useMastodonConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import { MastodonTagFeedPanel } from './tag-feed-panel';
import { MastodonReauthGate } from './use-mastodon-reauth-gate';

interface Props {
	connectionId: number;
	hashtag: string;
}

export function MastodonTagFeedView( { connectionId, hashtag }: Props ) {
	const translate = useTranslate();
	const { data, isPending, isError, refetch } = useMastodonConnectionsQuery();

	const connections = data?.connections ?? [];
	const connection = connections.find( ( c ) => c.id === connectionId ) ?? null;

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
				<DocumentHead title={ translate( 'Tag ‹ Mastodon ‹ Reader' ) } />
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
				<DocumentHead title={ translate( 'Tag ‹ Mastodon ‹ Reader' ) } />
				<div role="status" aria-live="polite">
					{ translate( 'Loading…' ) }
				</div>
			</ReaderMain>
		);
	}

	return (
		<ReaderMain className="mastodon-view">
			<DocumentHead title={ translate( '#%s ‹ Mastodon ‹ Reader', { args: hashtag } ) } />
			<MastodonReauthGate connection={ connection }>
				<MastodonTagFeedPanel connection={ connection } hashtag={ hashtag } />
			</MastodonReauthGate>
		</ReaderMain>
	);
}

export default MastodonTagFeedView;
