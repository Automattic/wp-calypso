import { useMastodonAuthStatusQuery, useMastodonConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import { ConnectionReauthTag } from 'calypso/reader/social';

function useMastodonAuthStatusForTag( connectionId: number ) {
	const r = useMastodonAuthStatusQuery( connectionId );
	return { needsReauth: r.data?.needs_reauth, isLoading: r.isPending };
}

export function MastodonLandingView() {
	const translate = useTranslate();
	const { data, isPending, isError, refetch } = useMastodonConnectionsQuery();

	useEffect( () => {
		if ( isPending || isError || ! data ) {
			return;
		}
		const first = data.connections[ 0 ];
		if ( first ) {
			page.replace( `/reader/mastodon/${ first.id }/timeline` );
		} else {
			page.replace( '/reader/mastodon/connect' );
		}
	}, [ isPending, data, isError ] );

	function renderBody() {
		if ( isError ) {
			return (
				<div role="alert" className="mastodon-error">
					<p>{ translate( "We couldn't load your Mastodon connections." ) }</p>
					<Button variant="secondary" onClick={ () => refetch() }>
						{ translate( 'Try again' ) }
					</Button>
				</div>
			);
		}
		if ( ! data ) {
			return (
				<div role="status" aria-live="polite">
					{ translate( 'Loading…' ) }
				</div>
			);
		}
		return (
			<ul className="mastodon-landing-connections">
				{ data.connections.map( ( connection ) => (
					<li key={ connection.id } className="mastodon-landing-connections__item">
						<span className="mastodon-landing-connections__handle">{ connection.handle }</span>
						<ConnectionReauthTag
							connectionId={ connection.id }
							useAuthStatus={ useMastodonAuthStatusForTag }
							label={ translate( 'Needs reconnect' ) as string }
						/>
					</li>
				) ) }
			</ul>
		);
	}

	return (
		<ReaderMain className="mastodon-view">
			<DocumentHead title={ translate( 'Mastodon ‹ Reader' ) } />
			{ renderBody() }
		</ReaderMain>
	);
}

export default MastodonLandingView;
