import { useMastodonConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Button, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';

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

	return (
		<ReaderMain className="mastodon-view">
			<DocumentHead title={ translate( 'Mastodon ‹ Reader' ) } />
			{ isError ? (
				<div role="alert" className="mastodon-error">
					<p>{ translate( "We couldn't load your Mastodon connections." ) }</p>
					<Button variant="secondary" onClick={ () => refetch() }>
						{ translate( 'Try again' ) }
					</Button>
				</div>
			) : (
				<div className="wp-spinner-wrapper" role="status" aria-live="polite">
					<Spinner />
					<p>{ translate( 'Loading…' ) }</p>
				</div>
			) }
		</ReaderMain>
	);
}

export default MastodonLandingView;
