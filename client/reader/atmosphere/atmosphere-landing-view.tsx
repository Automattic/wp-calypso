import { useConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Button, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';

export function AtmosphereLandingView() {
	const translate = useTranslate();
	const { data, isPending, isError, refetch } = useConnectionsQuery();

	useEffect( () => {
		if ( isPending || isError || ! data ) {
			return;
		}
		const first = data.connections[ 0 ];
		if ( first ) {
			page.replace( `/reader/atmosphere/${ first.id }/timeline` );
		} else {
			page.replace( '/reader/atmosphere/connect' );
		}
	}, [ isPending, data, isError ] );

	return (
		<ReaderMain className="atmosphere-view">
			<DocumentHead title={ translate( 'ATmosphere ‹ Reader' ) } />
			{ isError ? (
				<div role="alert" className="atmosphere-error">
					<p>{ translate( "We couldn't load your Bluesky connections." ) }</p>
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

export default AtmosphereLandingView;
