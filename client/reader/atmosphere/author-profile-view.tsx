import { useConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import { AuthorProfilePanel } from './author-profile-panel';

interface Props {
	connectionId: number;
	actor: string;
}

export function AuthorProfileView( { connectionId, actor }: Props ) {
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
				<DocumentHead title={ translate( 'Profile ‹ ATmosphere ‹ Reader' ) } />
				<div role="status" aria-live="polite">
					{ translate( 'Loading…' ) }
				</div>
			</ReaderMain>
		);
	}

	const docTitle = String( translate( '%(actor)s ‹ ATmosphere ‹ Reader', { args: { actor } } ) );
	return (
		<ReaderMain className="atmosphere-view">
			<DocumentHead title={ docTitle } />
			<AuthorProfilePanel connection={ connection } actor={ actor } />
		</ReaderMain>
	);
}

export default AuthorProfileView;
