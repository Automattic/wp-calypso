import { SiteDetails } from '@automattic/data-stores';
import debugFactory from 'debug';
import { useEffect } from 'react';
import { Flow, StepperStep } from '../types';

const debug = debugFactory( 'calypso:stepper:preloading' );

async function tryPreload( step?: StepperStep, followingStep?: StepperStep ) {
	if ( step && 'asyncComponent' in step ) {
		debug( 'Preloading next step:', step.slug );

		await step.asyncComponent();

		// Flows are indeterminate, they often pick one of the two next steps based on user input, so load two steps ahead.
		tryPreload( followingStep );
	}
}

/**
 * Preload the next step in the flow, if it's an async component.
 *
 * @param siteSlugOrId The site slug or ID.
 * @param selectedSite The selected site.
 * @param currentStepRoute The current step route.
 * @param flowSteps The flow steps.
 * @param flow The flow.
 */
export function usePreloadSteps(
	siteSlugOrId: string | number,
	selectedSite: SiteDetails | undefined | null,
	currentStepRoute: string,
	flowSteps: readonly StepperStep[],
	flow: Flow
) {
	useEffect( () => {
		if ( siteSlugOrId && ! selectedSite ) {
			// If this step depends on a selected site, only preload after we have the data.
			// Otherwise, we're still waiting to render something meaningful, and we don't want to
			// potentially slow that down by having the CPU busy initialising future steps.
			return;
		}
		if ( currentStepRoute ) {
			// The user step is a special case, as it's not part of the flow steps. It always comes in the end of the steps array.
			if ( currentStepRoute === 'user' ) {
				const nextStep = flowSteps[ 0 ];
				const nextNextStep = flowSteps[ 1 ];
				tryPreload( nextStep, nextNextStep );
			} else {
				const nextStepIndex = flowSteps.findIndex( ( step ) => step.slug === currentStepRoute ) + 1;
				const nextNextStepIndex = nextStepIndex + 1;

				const nextStep = flowSteps[ nextStepIndex ];
				const nextNextStep = flowSteps[ nextNextStepIndex ];

				tryPreload( nextStep, nextNextStep );
			}
		}
		// Most flows sadly instantiate a new steps array on every call to `flow.useSteps()`,
		// which means that we don't want to depend on `flowSteps` here, or this would end up
		// running on every render. We thus depend on `flow` instead.
		//
		// This should be safe, because flows shouldn't return different lists of steps at
		// different points. But even if they do, worst case scenario we only fail to preload
		// some steps, and they'll simply be loaded later.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ siteSlugOrId, selectedSite, currentStepRoute, flow ] );
}
