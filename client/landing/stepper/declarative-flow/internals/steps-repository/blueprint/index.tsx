import { StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import Loading from 'calypso/components/loading';
import { getBlueprintArchiveIdentifier } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/playground/lib/blueprint';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import {
	checkBlueprintExists,
	logBlueprintArchiveEvent,
} from 'calypso/landing/stepper/utils/blueprint-archive-import';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step as StepType } from '../../types';

export const BlueprintStep: StepType = ( { navigation } ) => {
	const { submit } = navigation;
	const { __ } = useI18n();
	const [ query, setQuery ] = useSearchParams();
	const { setBlueprint } = useDispatch( ONBOARD_STORE );
	const hasSubmitted = useRef( false );

	const blueprintParam = query.get( 'blueprint' ) ?? '';
	const buildDestParam = query.get( 'build_dest' ) ?? '';

	useEffect( () => {
		const fetchBlueprint = async () => {
			if ( hasSubmitted.current ) {
				return;
			}

			// A numeric Blueprint library post ID or a post slug, both resolved on
			// blueprintlibrary.wordpress.com by the import backends.
			const id = getBlueprintArchiveIdentifier( query );

			if ( ! id ) {
				return;
			}

			// build_dest=wow restores the blueprint's pre-built archive onto an
			// Atomic site, so it needs that archive to exist on the library post.
			// Verify up front; when missing, fall back to the legacy Simple-site
			// import by stripping the param (tracked, so missing archives surface).
			if ( 'wow' === buildDestParam ) {
				const hasArchive = await checkBlueprintExists( id );

				if ( ! hasArchive ) {
					recordTracksEvent( 'calypso_blueprint_build_dest_wow_archive_missing', {
						blueprint: id,
					} );
					logBlueprintArchiveEvent( 'wow_archive_missing', { blueprint: id } );

					// Strip through the router rather than window.history: navigation to
					// a logged-out user's auth step builds its path from the router's
					// search params, which a plain history.replaceState would leave
					// holding build_dest=wow. Submitting is deferred to the re-run of
					// this effect, once the sanitized query is what navigation will
					// carry forward.
					const sanitized = new URLSearchParams( query );
					sanitized.delete( 'build_dest' );
					setQuery( sanitized, { replace: true } );
					return;
				}
			}

			// Save the Blueprint library identifier to the store
			hasSubmitted.current = true;
			setBlueprint( id );
			submit();
		};

		fetchBlueprint();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ blueprintParam, buildDestParam ] );

	return (
		<>
			<DocumentHead title={ __( 'Blueprint' ) } />
			<StepContainer
				shouldHideNavButtons
				hideFormattedHeader
				stepName="load-blueprint"
				recordTracksEvent={ recordTracksEvent }
				stepContent={ <Loading title={ __( 'Loading Blueprint' ) } /> }
			/>
		</>
	);
};

export default BlueprintStep;
