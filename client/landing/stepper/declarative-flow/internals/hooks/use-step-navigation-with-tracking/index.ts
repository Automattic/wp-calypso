import { OnboardSelect, StepperInternalSelect } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useCallback, useMemo } from '@wordpress/element';
import {
	STEPPER_TRACKS_EVENT_STEP_NAV_EXIT_FLOW,
	STEPPER_TRACKS_EVENT_STEP_NAV_GO_BACK,
	STEPPER_TRACKS_EVENT_STEP_NAV_GO_NEXT,
	STEPPER_TRACKS_EVENT_STEP_NAV_GO_TO,
	STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT,
} from 'calypso/landing/stepper/constants';
import { ONBOARD_STORE, STEPPER_INTERNAL_STORE } from 'calypso/landing/stepper/stores';
import {
	recordStepNavigation,
	type RecordStepNavigationParams,
} from '../../analytics/record-step-navigation';
import type { Flow, Navigate, ProvidedDependencies, StepperStep } from '../../types';

interface Params< FlowSteps extends StepperStep[] > {
	flow: Flow;
	stepSlugs: StepperStep[ 'slug' ][];
	currentStepRoute: StepperStep[ 'slug' ];
	navigate: Navigate< FlowSteps >;
}

export const useStepNavigationWithTracking = ( {
	flow,
	stepSlugs,
	currentStepRoute,
	navigate,
}: Params< StepperStep[] > ) => {
	// We don't know the type of the return value of useStepNavigation, because we don't know which flow is this.
	// So we cast it to any.
	const stepNavigationV1: any =
		'useStepNavigation' in flow ? flow.useStepNavigation( currentStepRoute, navigate ) : null;

	// Stepper's V2 API doesn't have useHandleSubmit, it uses useHandleSubmit instead.
	const flowSubmissionHandler = 'useHandleSubmit' in flow ? flow.useHandleSubmit : null;

	const { intent, goals } = useSelect( ( select ) => {
		const onboardStore = select( ONBOARD_STORE ) as OnboardSelect;
		return {
			intent: onboardStore.getIntent(),
			goals: onboardStore.getGoals(),
		};
	}, [] );

	const stepData = useSelect(
		( select ) => ( select( STEPPER_INTERNAL_STORE ) as StepperInternalSelect ).getStepData(),
		[]
	);

	/**
	 * If the previous step is defined in the store, and the current step is not the first step, we can go back.
	 * We need to make sure we're not at the first step because `previousStep` is persisted and can be a step from another flow or another run of the current flow.
	 * We include a check for whether the previous step is the same sort of step as the current step. This can happen briefly while transitioning from one step to
	 * the next where the onboard store data has updated, but `currentStepRoute` hasn't yet because the step hasn't been rendered yet. This would cause the back button
	 * to flash briefly while navigating.
	 */
	const canUserGoBack =
		stepData?.previousStep &&
		currentStepRoute !== stepSlugs[ 0 ] &&
		history.length > 1 &&
		stepData.previousStep !== currentStepRoute;

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

	const deprecatedNavigationControlsForStepperV1 = useMemo(
		() => ( {
			...( stepNavigationV1.submit && {
				// TODO: remove = {}, there is no need to default to {}.
				submit: ( providedDependencies: ProvidedDependencies ) => {
					if ( ! providedDependencies?.shouldSkipSubmitTracking ) {
						handleRecordStepNavigation( {
							event: STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT,
							providedDependencies,
						} );
					}
					stepNavigationV1.submit?.( providedDependencies );
				},
			} ),
			...( stepNavigationV1.exitFlow && {
				exitFlow: ( to: string ) => {
					handleRecordStepNavigation( {
						event: STEPPER_TRACKS_EVENT_STEP_NAV_EXIT_FLOW,
						providedDependencies: {
							eventProps: {
								to,
							},
						},
					} );
					stepNavigationV1.exitFlow?.( to );
				},
			} ),
			/**
			 * If the `previousStep` is defined in the store, it's a solid proxy to guess that we navigated at least once via Stepper's React Router.
			 * If the flow doesn't define a `goBack` handler, and `previousStep` is defined, we can just go history.back() and we'll remain in the flow.
			 * But if `previousStep` is not defined, and the flow doesn't define a `goBack` handler, we should return undefined so the StepContainer doesn't render a back button.
			 */
			...( canUserGoBack && {
				goBack: () => {
					handleRecordStepNavigation( {
						event: STEPPER_TRACKS_EVENT_STEP_NAV_GO_BACK,
					} );
					history.back();
				},
			} ),
			/**
			 * If the flow defines a `goBack` handler, this will overwrite the one above. Flow is the ultimate authority on navigation.
			 */
			...( stepNavigationV1.goBack && {
				goBack: () => {
					handleRecordStepNavigation( {
						event: STEPPER_TRACKS_EVENT_STEP_NAV_GO_BACK,
					} );
					stepNavigationV1.goBack?.();
				},
			} ),
			...( stepNavigationV1.goNext && {
				goNext: () => {
					handleRecordStepNavigation( {
						event: STEPPER_TRACKS_EVENT_STEP_NAV_GO_NEXT,
					} );
					stepNavigationV1.goNext?.();
				},
			} ),
			...( stepNavigationV1.goToStep && {
				goToStep: ( step: string ) => {
					handleRecordStepNavigation( {
						event: STEPPER_TRACKS_EVENT_STEP_NAV_GO_TO,
						providedDependencies: {
							eventProps: {
								to: step,
							},
						},
					} );
					stepNavigationV1.goToStep?.( step );
				},
			} ),
		} ),
		[ handleRecordStepNavigation, stepNavigationV1 ]
	);

	const navigationControlsForStepperV2 = useMemo(
		() => ( {
			...( flowSubmissionHandler && {
				// TODO: remove = {}, there is no need to default to {}.
				submit: ( providedDependencies: ProvidedDependencies ) => {
					if ( ! providedDependencies?.shouldSkipSubmitTracking ) {
						handleRecordStepNavigation( {
							event: STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT,
							providedDependencies,
						} );
					}
					flowSubmissionHandler( { slug: currentStepRoute, providedDependencies }, navigate );
				},
			} ),
		} ),
		[ handleRecordStepNavigation, flowSubmissionHandler, currentStepRoute, navigate ]
	);

	if ( 'useHandleSubmit' in flow ) {
		return navigationControlsForStepperV2;
	}

	return deprecatedNavigationControlsForStepperV1;
};
