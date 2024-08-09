import { OnboardSelect } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT } from 'calypso/landing/stepper/constants';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordSubmitStep } from '../../analytics/record-submit-step';
import type { Flow, Navigate, ProvidedDependencies, StepperStep } from '../../types';

interface Params< FlowSteps extends StepperStep[] > {
	flow: Flow;
	currentStepRoute: string;
	navigate: Navigate< FlowSteps >;
	steps: StepperStep[];
}

export const useStepNavigationWithTracking = ( {
	flow: { useTracksEventProps, useStepNavigation, name: flowName, variantSlug },
	currentStepRoute,
	navigate,
	steps,
}: Params< ReturnType< Flow[ 'useSteps' ] > > ) => {
	const stepNavigation = useStepNavigation(
		currentStepRoute,
		navigate,
		steps.map( ( step ) => step.slug )
	);
	const intent =
		useSelect( ( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(), [] ) ?? '';

	const tracksEventPropsSubmit = useTracksEventProps?.( STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT );

	return useMemo(
		() => ( {
			...stepNavigation,
			submit: ( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) => {
				recordSubmitStep(
					providedDependencies,
					intent,
					flowName,
					currentStepRoute,
					variantSlug,
					tracksEventPropsSubmit
				);
				stepNavigation.submit?.( providedDependencies, ...params );
			},
		} ),
		[ stepNavigation, intent, flowName, currentStepRoute, variantSlug, tracksEventPropsSubmit ]
	);
};
