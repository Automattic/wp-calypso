import { StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
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
	const [ query ] = useSearchParams();
	const { setBlueprint } = useDispatch( ONBOARD_STORE );

	useEffect( () => {
		const fetchBlueprint = async () => {
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
			if ( query.get( 'build_dest' ) === 'wow' ) {
				const hasArchive = await checkBlueprintExists( id );

				if ( ! hasArchive ) {
					recordTracksEvent( 'calypso_blueprint_build_dest_wow_archive_missing', {
						blueprint: id,
					} );
					logBlueprintArchiveEvent( 'wow_archive_missing', { blueprint: id } );

					const url = new URL( window.location.href );
					url.searchParams.delete( 'build_dest' );
					window.history.replaceState( null, '', url.toString() );
				}
			}

			// Save the Blueprint library identifier to the store
			setBlueprint( id );
			submit();
		};

		fetchBlueprint();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

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
