import { OnboardSelect } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useCallback, useMemo } from '@wordpress/element';
import {
	STEPPER_TRACKS_EVENT_STEP_NAV_EXIT_FLOW,
	STEPPER_TRACKS_EVENT_STEP_NAV_GO_BACK,
	STEPPER_TRACKS_EVENT_STEP_NAV_GO_NEXT,
	STEPPER_TRACKS_EVENT_STEP_NAV_GO_TO,
	STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT,
} from 'calypso/landing/stepper/constants';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import {
	recordStepNavigation,
	type RecordStepNavigationParams,
} from '../../analytics/record-step-navigation';
import type { Flow, Navigate, ProvidedDependencies, StepperStep } from '../../types';

interface Params< FlowSteps extends StepperStep[] > {
	flow: Flow;
	currentStepRoute: string;
	navigate: Navigate< FlowSteps >;
	steps: StepperStep[];
}

export const useStepNavigationWithTracking = ( {
	flow,
	currentStepRoute,
	navigate,
	steps,
}: Params< ReturnType< Flow[ 'useSteps' ] > > ) => {
	const stepNavigation = flow.useStepNavigation(
		currentStepRoute,
		navigate,
		steps.map( ( step ) => step.slug )
	);
	const intent =
		useSelect( ( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(), [] ) ?? '';
	const tracksEventPropsFromFlow = flow.useTracksEventProps?.();

	const handleRecordStepNavigation = useCallback(
		( {
			event,
			providedDependencies,
			additionalProps,
		}: Omit< RecordStepNavigationParams, 'step' | 'intent' | 'flow' | 'variant' > ) => {
			recordStepNavigation( {
				event,
				intent,
				flow: flow.name,
				step: currentStepRoute,
				variant: flow.variantSlug,
				providedDependencies,
				additionalProps,
			} );
		},
		[ intent, currentStepRoute, flow ]
	);

	return useMemo(
		() => ( {
			submit: ( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) => {
				handleRecordStepNavigation( {
					event: STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT,
					providedDependencies,
					additionalProps: tracksEventPropsFromFlow?.[ STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT ],
				} );
				stepNavigation.submit?.( providedDependencies, ...params );
			},
			exitFlow: ( to: string ) => {
				handleRecordStepNavigation( {
					event: STEPPER_TRACKS_EVENT_STEP_NAV_EXIT_FLOW,
					additionalProps: {
						to,
						...( tracksEventPropsFromFlow?.[ STEPPER_TRACKS_EVENT_STEP_NAV_EXIT_FLOW ] ?? {} ),
					},
				} );
				stepNavigation.exitFlow?.( to );
			},
			goBack: () => {
				handleRecordStepNavigation( {
					event: STEPPER_TRACKS_EVENT_STEP_NAV_GO_BACK,
					additionalProps: tracksEventPropsFromFlow?.[ STEPPER_TRACKS_EVENT_STEP_NAV_GO_BACK ],
				} );
				stepNavigation.goBack?.();
			},
			goNext: () => {
				handleRecordStepNavigation( {
					event: STEPPER_TRACKS_EVENT_STEP_NAV_GO_NEXT,
					additionalProps: tracksEventPropsFromFlow?.[ STEPPER_TRACKS_EVENT_STEP_NAV_GO_NEXT ],
				} );
				stepNavigation.goNext?.();
			},
			goToStep: ( step: string ) => {
				handleRecordStepNavigation( {
					event: STEPPER_TRACKS_EVENT_STEP_NAV_GO_TO,
					additionalProps: {
						to: step,
						...( tracksEventPropsFromFlow?.[ STEPPER_TRACKS_EVENT_STEP_NAV_GO_TO ] ?? {} ),
					},
				} );
				stepNavigation.goToStep?.( step );
			},
		} ),
		[ handleRecordStepNavigation, tracksEventPropsFromFlow, stepNavigation ]
	);
};
