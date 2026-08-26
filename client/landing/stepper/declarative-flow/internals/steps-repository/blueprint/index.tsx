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
	// The wow funnel builds the Atomic site from the blueprint's archive, before checkout.
	const wowFunnelParam = query.get( 'wow_funnel' ) ?? '';

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

			// The wow funnel restores the blueprint's pre-built archive onto the Atomic site it
			// builds before checkout, so that archive has to exist on the library post. Verify
			// up front; when missing, fall back to the legacy Simple-site import by stripping
			// the params (tracked, so missing archives surface).
			if ( 'blueprint' === wowFunnelParam ) {
				const hasArchive = await checkBlueprintExists( id );

				if ( ! hasArchive ) {
					// Event name predates the retired build_dest=wow param it was written for.
					// Kept as-is so existing dashboards keep working; it now means "the wow
					// funnel found no archive".
					recordTracksEvent( 'calypso_blueprint_build_dest_wow_archive_missing', {
						blueprint: id,
					} );
					logBlueprintArchiveEvent( 'wow_archive_missing', { blueprint: id } );

					// Strip through the router rather than window.history: navigation to
					// a logged-out user's auth step builds its path from the router's
					// search params, which a plain history.replaceState would leave
					// holding the Atomic params. Submitting is deferred to the re-run of
					// this effect, once the sanitized query is what navigation will
					// carry forward.
					//
					// wow_funnel and dest go together: leaving the funnel on would build an
					// Atomic site with nothing to import onto it, and leaving dest on would
					// send the customer to a site-spec waiting for an import that never runs.
					const sanitized = new URLSearchParams( query );
					sanitized.delete( 'wow_funnel' );
					sanitized.delete( 'dest' );
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
	}, [ blueprintParam, wowFunnelParam ] );

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
