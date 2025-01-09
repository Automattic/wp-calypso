//* This hook is used to track the step route in the declarative flow.

import { isAnyHostingFlow } from '@automattic/onboarding';
import { useEffect, useRef } from '@wordpress/element';
import { STEPPER_TRACKS_EVENT_SIGNUP_STEP_START } from 'calypso/landing/stepper/constants';
import { getStepOldSlug } from 'calypso/landing/stepper/declarative-flow/helpers/get-step-old-slug';
import recordStepComplete, {
	type RecordStepCompleteProps,
} from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-step-complete';
import recordStepStart from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-step-start';
import { useIntent } from 'calypso/landing/stepper/hooks/use-intent';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import kebabCase from 'calypso/landing/stepper/utils/kebabCase';
import useSnakeCasedKeys from 'calypso/landing/stepper/utils/use-snake-cased-keys';
import { recordPageView } from 'calypso/lib/analytics/page-view';
import {
	getSignupCompleteFlowName,
	getSignupCompleteStepNameAndClear,
} from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { isRequestingSite } from 'calypso/state/sites/selectors';
import type { Flow } from 'calypso/landing/stepper/declarative-flow/internals/types';

/**
 * We wait for the site to be fetched before tracking the step route when a site ID/slug are defined in the params.
 * This is to ensure that the site data is available for event tracking purposes.
 * See `superProps`, `site_plan_id`, and https://github.com/Automattic/wp-calypso/pull/82981.
 */
const useHasRequestedSelectedSite = () => {
	const { site, siteSlugOrId } = useSiteData();
	const isRequestingSelectedSite = useSelector(
		( state ) => site && isRequestingSite( state, siteSlugOrId )
	);

	return siteSlugOrId ? !! site && ! isRequestingSelectedSite : true;
};

interface Props {
	flow: Flow;
	stepSlug: string;
	skipStepRender?: boolean;
}

/**
 * Hook to track the step route in the declarative flow.
 */
export const useStepRouteTracking = ( { flow, stepSlug, skipStepRender }: Props ) => {
	const intent = useIntent();
	const hasRequestedSelectedSite = useHasRequestedSelectedSite();
	const stepCompleteEventPropsRef = useRef< RecordStepCompleteProps | null >( null );
	const pathname = window.location.pathname;
	const flowVariantSlug = flow.variantSlug;
	const flowName = flow.name;
	const signupStepStartProps = useSnakeCasedKeys( {
		input: flow.useTracksEventProps?.()?.[ STEPPER_TRACKS_EVENT_SIGNUP_STEP_START ],
	} );

	/**
	 * Cleanup effect to record step-complete event when `StepRoute` unmounts.
	 * This is to ensure that the event is recorded when the user navigates away from the step.
	 * We only record this if step-start event gets recorded and `stepCompleteEventPropsRef.current` is populated (as a result).
	 */
	useEffect( () => {
		return () => {
			if ( stepCompleteEventPropsRef.current ) {
				recordStepComplete( stepCompleteEventPropsRef.current );
			}
		};
		// IMPORTANT: Do not add dependencies to this effect, as it should only record when the component unmounts.
	}, [] );

	useEffect( () => {
		// We wait for the site to be fetched before tracking the step route.
		if ( ! hasRequestedSelectedSite ) {
			return;
		}

		const signupCompleteFlowName = getSignupCompleteFlowName();
		const signupCompleteStepName = getSignupCompleteStepNameAndClear();
		const isReEnteringStepAfterSignupComplete =
			signupCompleteFlowName === flowName && signupCompleteStepName === stepSlug;

		const reenteringStepAfterSignupCompleteProps = {
			...( isReEnteringStepAfterSignupComplete && {
				is_reentering_step_after_signup_complete: true,
			} ),
			...( signupCompleteFlowName && { signup_complete_flow_name: signupCompleteFlowName } ),
			...( signupCompleteStepName && { signup_complete_step_name: signupCompleteStepName } ),
		};

		recordStepStart( flowName, kebabCase( stepSlug ), {
			intent,
			is_in_hosting_flow: isAnyHostingFlow( flowName ),
			...( flowVariantSlug && { flow_variant: flowVariantSlug } ),
			...( skipStepRender && { skip_step_render: skipStepRender } ),
			...reenteringStepAfterSignupCompleteProps,
			...signupStepStartProps,
		} );

		// Apply the props to record in the exit/step-complete event. We only record this if start event gets recorded.
		stepCompleteEventPropsRef.current = {
			flow: flowName,
			step: stepSlug,
			optionalProps: {
				intent,
				...( skipStepRender && { skip_step_render: skipStepRender } ),
				...reenteringStepAfterSignupCompleteProps,
			},
		};

		const stepOldSlug = getStepOldSlug( stepSlug );
		if ( stepOldSlug ) {
			recordStepStart( flowName, kebabCase( stepOldSlug ), {
				intent,
				is_in_hosting_flow: isAnyHostingFlow( flowName ),
				...( flowVariantSlug && { flow_variant: flowVariantSlug } ),
				...( skipStepRender && { skip_step_render: skipStepRender } ),
				...reenteringStepAfterSignupCompleteProps,
				...signupStepStartProps,
			} );
		}

		// Also record page view for data and analytics
		const pageTitle = `Setup > ${ flowName } > ${ stepSlug }`;
		const params = {
			flow: flowName,
			...( skipStepRender && { skip_step_render: skipStepRender } ),
			...reenteringStepAfterSignupCompleteProps,
		};
		recordPageView( pathname, pageTitle, params );

		// We leave out intent and design from the dependency list, due to the ONBOARD_STORE being reset in the exit flow.
		// The store reset causes these values to become empty, and may trigger this event again.
		// We also leave out pathname. The respective event (calypso_page_view) is recorded behind a timeout and we don't want to trigger it again.
		//     - window.location.pathname called inside the effect keeps referring to the previous path on a redirect. So we moved it outside.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ flowName, hasRequestedSelectedSite, stepSlug, skipStepRender ] );
};
