import { useConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
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
	const { data, isPending } = useConnectionsQuery();

	const connections = data?.connections ?? [];
	const connection = connections.find( ( c ) => c.id === connectionId ) ?? null;

	useEffect( () => {
		if ( isPending ) {
			return;
		}
		if ( ! connection ) {
			page.replace( '/reader/atmosphere' );
		}
	}, [ isPending, connection ] );

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
