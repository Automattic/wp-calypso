import { useFediverseConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import { FediverseAuthorProfilePanel } from './author-profile-panel';

interface Props {
	connectionId: number;
	actor: string;
}

export function FediverseAuthorProfileView( { connectionId, actor }: Props ) {
	const translate = useTranslate();
	const { data, isPending } = useFediverseConnectionsQuery();

	const connections = data?.connections ?? [];
	const connection = connections.find( ( c ) => c.id === connectionId ) ?? null;

	useEffect( () => {
		if ( isPending ) {
			return;
		}
		if ( ! connection ) {
			page.replace( '/reader/fediverse' );
		}
	}, [ isPending, connection ] );

	if ( ! connection ) {
		return (
			<ReaderMain className="fediverse-view">
				<DocumentHead title={ translate( 'Fediverse ‹ Reader' ) } />
				<div className="wp-spinner-wrapper" role="status" aria-live="polite">
					<Spinner />
					<p>{ translate( 'Loading…' ) }</p>
				</div>
			</ReaderMain>
		);
	}

	return (
		<ReaderMain className="fediverse-view">
			<DocumentHead
				title={
					translate( '%(actor)s ‹ Fediverse ‹ Reader', {
						args: { actor },
					} ) as string
				}
			/>
			<FediverseAuthorProfilePanel connection={ connection } actor={ actor } />
		</ReaderMain>
	);
}

export default FediverseAuthorProfileView;
