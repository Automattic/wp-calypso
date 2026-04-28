import { useConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import { ThreadPanel } from './thread-panel';

interface Props {
	connectionId: number;
	did: string;
	rkey: string;
}

export function AtmosphereThreadView( { connectionId, did, rkey }: Props ) {
	const translate = useTranslate();
	const { data, isPending, isError, refetch } = useConnectionsQuery();

	const connections = data?.connections ?? [];
	const connection = connections.find( ( c ) => c.id === connectionId ) ?? null;

	useEffect( () => {
		if ( isPending || isError ) {
			return;
		}
		if ( ! connection ) {
			page.replace( '/reader/atmosphere' );
		}
	}, [ isPending, isError, connection, connectionId ] );

	if ( isError ) {
		return (
			<ReaderMain className="atmosphere-view">
				<DocumentHead title={ translate( 'Thread ‹ ATmosphere ‹ Reader' ) } />
				<div role="alert" className="atmosphere-error">
					<p>{ translate( "We couldn't load your Bluesky connections." ) }</p>
					<Button variant="secondary" onClick={ () => refetch() }>
						{ translate( 'Try again' ) }
					</Button>
				</div>
			</ReaderMain>
		);
	}

	if ( ! connection ) {
		return (
			<ReaderMain className="atmosphere-view">
				<DocumentHead title={ translate( 'Thread ‹ ATmosphere ‹ Reader' ) } />
				<div role="status" aria-live="polite">
					{ translate( 'Loading…' ) }
				</div>
			</ReaderMain>
		);
	}

	return (
		<ReaderMain className="atmosphere-view">
			<DocumentHead
				title={ translate( '%s ‹ ATmosphere ‹ Reader', { args: connection.handle } ) }
			/>
			<ThreadPanel connection={ connection } did={ did } rkey={ rkey } />
		</ReaderMain>
	);
}

export default AtmosphereThreadView;
