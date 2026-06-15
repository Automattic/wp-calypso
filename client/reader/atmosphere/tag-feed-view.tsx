import { useConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Button, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import { TagFeedPanel } from './tag-feed-panel';

interface Props {
	connectionId: number;
	hashtag: string;
}

export function TagFeedView( { connectionId, hashtag }: Props ) {
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
				<DocumentHead title={ translate( 'Tag ‹ Bluesky ‹ Reader' ) } />
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
				<DocumentHead title={ translate( 'Tag ‹ Bluesky ‹ Reader' ) } />
				<div className="wp-spinner-wrapper" role="status" aria-live="polite">
					<Spinner />
					<p>{ translate( 'Loading…' ) }</p>
				</div>
			</ReaderMain>
		);
	}

	return (
		<ReaderMain className="atmosphere-view">
			<DocumentHead title={ translate( '#%s ‹ Bluesky ‹ Reader', { args: hashtag } ) } />
			<TagFeedPanel connection={ connection } hashtag={ hashtag } />
		</ReaderMain>
	);
}

export default TagFeedView;
