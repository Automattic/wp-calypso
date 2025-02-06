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
}

export const useStepNavigationWithTracking = ( {
	flow,
	currentStepRoute,
	navigate,
}: Params< StepperStep[] > ) => {
	const stepNavigation = flow.useStepNavigation( currentStepRoute, navigate );
	const { intent, goals } = useSelect( ( select ) => {
		const onboardStore = select( ONBOARD_STORE ) as OnboardSelect;
		return {
			intent: onboardStore.getIntent(),
			goals: onboardStore.getGoals(),
		};
	}, [] );

	const tracksEventPropsFromFlow = flow.useTracksEventProps?.();

	const handleRecordStepNavigation = useCallback(
		( {
			event,
			providedDependencies,
		}: Omit< RecordStepNavigationParams, 'step' | 'intent' | 'goals' | 'flow' | 'variant' > ) => {
			const { eventProps, ...dependencies } = providedDependencies || {};

			recordStepNavigation( {
				event,
				intent: intent ?? '',
				goals: goals ?? [],
				flow: flow.name,
				step: currentStepRoute,
				variant: flow.variantSlug,
				providedDependencies: dependencies,
				additionalProps: {
					...( eventProps ?? {} ),
					// Don't add eventProps if `useTracksEventProps` is still loading.
					// It's not tight, but it's a trade-off to avoid firing events with incorrect props.
					// It's a tiny edge case where the use navigates before this hook is ready.
					...( tracksEventPropsFromFlow?.isLoading
						? undefined
						: tracksEventPropsFromFlow?.eventsProperties?.[ event ] ?? {} ),
				},
			} );
		},
		[ intent, tracksEventPropsFromFlow, goals, currentStepRoute, flow ]
	);

	return useMemo(
		() => ( {
			...( stepNavigation.submit && {
				submit: ( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) => {
					if ( ! providedDependencies?.shouldSkipSubmitTracking ) {
						handleRecordStepNavigation( {
							event: STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT,
							providedDependencies,
						} );
					}
					stepNavigation.submit?.( providedDependencies, ...params );
				},
			} ),
			...( stepNavigation.exitFlow && {
				exitFlow: ( to: string ) => {
					handleRecordStepNavigation( {
						event: STEPPER_TRACKS_EVENT_STEP_NAV_EXIT_FLOW,
						providedDependencies: {
							eventProps: {
								to,
							},
						},
					} );
					stepNavigation.exitFlow?.( to );
				},
			} ),
			...( stepNavigation.goBack && {
				goBack: () => {
					handleRecordStepNavigation( {
						event: STEPPER_TRACKS_EVENT_STEP_NAV_GO_BACK,
					} );
					stepNavigation.goBack?.();
				},
			} ),
			...( stepNavigation.goNext && {
				goNext: () => {
					handleRecordStepNavigation( {
						event: STEPPER_TRACKS_EVENT_STEP_NAV_GO_NEXT,
					} );
					stepNavigation.goNext?.();
				},
			} ),
			...( stepNavigation.goToStep && {
				goToStep: ( step: string ) => {
					handleRecordStepNavigation( {
						event: STEPPER_TRACKS_EVENT_STEP_NAV_GO_TO,
						providedDependencies: {
							eventProps: {
								to: step,
							},
						},
					} );
					stepNavigation.goToStep?.( step );
				},
			} ),
		} ),
		[ handleRecordStepNavigation, stepNavigation ]
	);
};
