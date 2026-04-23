import { useConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';

export function AtmosphereLandingView() {
	const translate = useTranslate();
	const { data, isPending } = useConnectionsQuery( { enabled: true } );

	useEffect( () => {
		if ( isPending || ! data ) {
			return;
		}
		const first = data.connections[ 0 ];
		if ( first ) {
			page.replace( `/reader/atmosphere/${ first.id }/timeline` );
		} else {
			page.replace( '/reader/atmosphere/connect' );
		}
	}, [ isPending, data ] );

	return (
		<ReaderMain className="atmosphere-view">
			<DocumentHead title={ translate( 'ATmosphere ‹ Reader' ) } />
			<div role="status" aria-live="polite">
				{ translate( 'Loading…' ) }
			</div>
		</ReaderMain>
	);
}

export default AtmosphereLandingView;
