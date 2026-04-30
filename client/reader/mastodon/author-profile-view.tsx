import {
	useMastodonAuthorProfileQuery,
	useMastodonConnectionsQuery,
} from '@automattic/api-queries';
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
			<MastodonAuthorProfileTitle connectionId={ connection.id } actor={ actor } />
			<MastodonAuthorProfilePanel connection={ connection } actor={ actor } />
		</ReaderMain>
	);
}

// Pulls the canonical webfinger handle from the profile cache so the document
// title reads `@alice@instance.tld ‹ Mastodon ‹ Reader` even when the URL is
// keyed by numeric id (`108020 ‹ Mastodon ‹ Reader` is unhelpful). The query
// is shared with the panel below — same connection + actor — so no extra
// network hit. Falls back to the URL-segment actor while the profile loads.
function MastodonAuthorProfileTitle( {
	connectionId,
	actor,
}: {
	connectionId: number;
	actor: string;
} ) {
	const translate = useTranslate();
	const { data } = useMastodonAuthorProfileQuery( connectionId, actor );
	const handle = data?.acct ?? actor;
	return <DocumentHead title={ translate( '%s ‹ Mastodon ‹ Reader', { args: handle } ) } />;
}

export default MastodonAuthorProfileView;
