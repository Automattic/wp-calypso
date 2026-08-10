import { StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import Loading from 'calypso/components/loading';
import { getBlueprintID } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/playground/lib/blueprint';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step as StepType } from '../../types';

export const BlueprintStep: StepType = ( { navigation } ) => {
	const { submit } = navigation;
	const { __ } = useI18n();
	const [ query ] = useSearchParams();
	const { setBlueprint } = useDispatch( ONBOARD_STORE );

	useEffect( () => {
		const fetchBlueprint = async () => {
			const id = getBlueprintID( query );

			if ( id ) {
				// Save the Blueprint library ID to the store
				setBlueprint( id );
				submit();
			}
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
