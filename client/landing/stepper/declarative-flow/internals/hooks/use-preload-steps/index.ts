import { SiteDetails } from '@automattic/data-stores';
import debugFactory from 'debug';
import { useEffect } from 'react';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import type { Flow, FlowV2, StepperStep } from '../../types';

const debug = debugFactory( 'calypso:stepper:preloading' );

export const lazyCache = new WeakMap<
	StepperStep[ 'asyncComponent' ],
	Awaited< ReturnType< StepperStep[ 'asyncComponent' ] > >[ 'default' ]
>();

async function tryPreload( step?: StepperStep, followingStep?: StepperStep ) {
	if ( step && 'asyncComponent' in step ) {
		debug( 'Preloading step:', step.slug );
		const { default: component } = await step.asyncComponent();
		lazyCache.set( step.asyncComponent, component );
	}
	// Flows are indeterminate, they often pick one of the two next steps based on user input, so load two steps ahead.
	if ( followingStep ) {
		tryPreload( followingStep );
	}
}

/**
 * Preload the next step in the flow, if it's an async component.
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
	flow: Flow | FlowV2< any >
) {
	const isLoggedIn = useSelector( isUserLoggedIn );

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
				// Load the first steps that requires authentication.
				const nextStepIndex = flowSteps.findIndex( ( step ) => step.requiresLoggedInUser );
				const nextStep = flowSteps[ nextStepIndex ];
				const nextNextStep = flowSteps[ nextStepIndex + 1 ];
				tryPreload( nextStep, nextNextStep );
			} else {
				// If any step requires authentication, preload the user step.
				if ( ! isLoggedIn && flowSteps.some( ( step ) => step.requiresLoggedInUser ) ) {
					const userStep = flowSteps.find( ( step ) => step.slug === 'user' );
					tryPreload( userStep );
				}

				const currentStepIndex = flowSteps.findIndex( ( step ) => step.slug === currentStepRoute );
				if ( currentStepIndex !== -1 ) {
					const nextStep = flowSteps[ currentStepIndex + 1 ];
					const nextNextStep = flowSteps[ currentStepIndex + 2 ];

					tryPreload( nextStep, nextNextStep );
				}
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
