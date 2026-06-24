import { useAtmosphereScopedProfileQuery, useConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Button, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import { AuthorProfileHeader } from 'calypso/reader/social';
import { ComposeFab, ComposerModal, ComposerProvider } from 'calypso/reader/social/composer';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { AuthorProfilePanel } from './author-profile-panel';
import { atmosphereComposerConfig } from './composer-config';
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
				<div className="wp-spinner-wrapper" role="status" aria-live="polite">
					<Spinner />
					<p>{ translate( 'Loading…' ) }</p>
				</div>
			</ReaderMain>
		);
	}

	const subtabBasePath = `/reader/atmosphere/${ connection.id }/profile/${ encodeURIComponent(
		actor
	) }`;

	return (
		<ComposerProvider connectionId={ connection.id } config={ atmosphereComposerConfig }>
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
			<AuthorProfileComposeFab connectionId={ connection.id } actor={ actor } />
			<ComposerModal />
		</ComposerProvider>
	);
}

/**
 * Reads the canonical handle from the scoped-profile cache so the FAB
 * seeds the composer with `@<handle> ` even when the URL keys the
 * profile by DID. Falls back to the URL actor only when it's a usable
 * handle — DID-keyed URLs open with an empty composer while the query
 * is in flight rather than flashing `@did:plc:…`. The query is shared
 * with `AuthorProfilePanel`, so this hook does not add a network hit.
 */
function AuthorProfileComposeFab( {
	connectionId,
	actor,
}: {
	connectionId: number;
	actor: string;
} ) {
	const profile = useAtmosphereScopedProfileQuery( { connectionId, actor } );
	// `||` (not `??`) so an empty-string `handle` from a malformed
	// response also falls through to the actor branch.
	const handle = profile.data?.handle || ( actor.startsWith( 'did:' ) ? null : actor );
	return <ComposeFab initialText={ handle ? `@${ handle } ` : undefined } />;
}

export default AuthorProfileView;
