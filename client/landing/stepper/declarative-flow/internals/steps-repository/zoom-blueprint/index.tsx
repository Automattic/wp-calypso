import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Loading from 'calypso/components/loading';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step as StepType } from '../../types';

/**
 * `/setup/onboarding/zoom`, the Zoom partner link. The step has nothing to show or ask: the flow
 * routes its submit to the blueprint step with the Zoom blueprint and build destination set.
 */
export const ZoomBlueprintStep: StepType = ( { navigation } ) => {
	const { submit } = navigation;
	const { __ } = useI18n();
	const hasSubmitted = useRef( false );

	useEffect( () => {
		if ( hasSubmitted.current ) {
			return;
		}

		hasSubmitted.current = true;
		submit();
	}, [ submit ] );

	return (
		<>
			<DocumentHead title={ __( 'Blueprint' ) } />
			<StepContainer
				shouldHideNavButtons
				hideFormattedHeader
				stepName="zoom-blueprint"
				recordTracksEvent={ recordTracksEvent }
				stepContent={ <Loading title={ __( 'Loading Blueprint' ) } /> }
			/>
		</>
	);
};

export default ZoomBlueprintStep;
