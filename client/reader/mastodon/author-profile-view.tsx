import { useMastodonConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import { MastodonAuthorProfilePanel } from './author-profile-panel';

interface Props {
	connectionId: number;
	actor: string;
}

export function MastodonAuthorProfileView( { connectionId, actor }: Props ) {
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
				<DocumentHead title={ translate( 'Profile ‹ Mastodon ‹ Reader' ) } />
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
				<DocumentHead title={ translate( 'Profile ‹ Mastodon ‹ Reader' ) } />
				<div role="status" aria-live="polite">
					{ translate( 'Loading…' ) }
				</div>
			</ReaderMain>
		);
	}

	return (
		<ReaderMain className="mastodon-view">
			<DocumentHead title={ translate( '%s ‹ Mastodon ‹ Reader', { args: actor } ) } />
			<MastodonAuthorProfilePanel connection={ connection } actor={ actor } />
		</ReaderMain>
	);
}

export default MastodonAuthorProfileView;
