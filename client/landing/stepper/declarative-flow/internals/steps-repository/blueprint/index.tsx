import { StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import Loading from 'calypso/components/loading';
import { getBlueprintLabelForTracking } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/playground/lib/blueprint';
import { resolveBlueprintFromURL } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/playground/lib/resolve-blueprint-from-url';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step as StepType } from '../../types';

export const BlueprintStep: StepType = ( { navigation, flow } ) => {
	const { submit } = navigation;
	const { __ } = useI18n();
	const [ query ] = useSearchParams();
	const { setBlueprint } = useDispatch( ONBOARD_STORE );

	useEffect( () => {
		const fetchBlueprint = async () => {
			const blueprintUrl = query.get( 'blueprint-url' );

			if ( ! blueprintUrl ) {
				return;
			}

			try {
				recordTracksEvent( 'calypso_blueprint_fetch_start', {
					flow,
					step: 'blueprint',
					blueprint: getBlueprintLabelForTracking( query ),
				} );

				const blueprint = await resolveBlueprintFromURL( new URL( window.location.href ) );

				if ( ! blueprint ) {
					return;
				}

				// Store the blueprint in the onboard store
				setBlueprint( blueprint );

				recordTracksEvent( 'calypso_blueprint_fetch_success', {
					flow,
					step: 'blueprint',
					blueprint_url: blueprintUrl,
				} );

				// Automatically move to the next step
				submit();
			} catch ( err ) {
				const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';

				recordTracksEvent( 'calypso_blueprint_fetch_error', {
					flow,
					step: 'blueprint',
					blueprint_url: blueprintUrl,
					error: errorMessage,
				} );
			}
		};

		fetchBlueprint();
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
