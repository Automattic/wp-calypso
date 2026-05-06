import { useConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import { AuthorProfileHeader } from 'calypso/reader/social';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { AuthorProfilePanel } from './author-profile-panel';
import { ComposeFab, ComposerModal, ComposerProvider } from './composer';
import { getTimelineUrl } from './route';
import type { AppState } from 'calypso/types';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

interface Props {
	connectionId: number;
	actor: string;
}

export function AuthorProfileView( { connectionId, actor }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const handleBackToTimeline = useCallback( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_atmosphere_profile_back_to_timeline_clicked', {
				connection_id: connectionId,
				actor,
			} )
		);
	}, [ connectionId, actor, dispatch ] );
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
				<DocumentHead title={ translate( 'Profile ‹ ATmosphere ‹ Reader' ) } />
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
				<DocumentHead title={ translate( 'Profile ‹ ATmosphere ‹ Reader' ) } />
				<div role="status" aria-live="polite">
					{ translate( 'Loading…' ) }
				</div>
			</ReaderMain>
		);
	}

	const subtabBasePath = `/reader/atmosphere/${ connection.id }/profile/${ encodeURIComponent(
		actor
	) }`;

	return (
		<ComposerProvider connectionId={ connection.id }>
			<ReaderMain className="atmosphere-view">
				<DocumentHead title={ translate( '%s ‹ ATmosphere ‹ Reader', { args: actor } ) } />
				<AuthorProfileHeader
					timelineUrl={ getTimelineUrl( connection.id ) }
					onBackToTimeline={ handleBackToTimeline }
				/>
				<AuthorProfilePanel
					connection={ connection }
					actor={ actor }
					subtabBasePath={ subtabBasePath }
				/>
			</ReaderMain>
			<ComposeFab />
			<ComposerModal />
		</ComposerProvider>
	);
}

export default AuthorProfileView;
