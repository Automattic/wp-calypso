//* This hook is used to track the step route in the declarative flow.

import { isAnyHostingFlow } from '@automattic/onboarding';
import { useEffect, useRef } from '@wordpress/element';
import { getStepOldSlug } from 'calypso/landing/stepper/declarative-flow/helpers/get-step-old-slug';
import { getAssemblerSource } from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-design';
import recordStepComplete, {
	type RecordStepCompleteProps,
} from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-step-complete';
import recordStepStart from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-step-start';
import { useIntent } from 'calypso/landing/stepper/hooks/use-intent';
import { useSelectedDesign } from 'calypso/landing/stepper/hooks/use-selected-design';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import kebabCase from 'calypso/landing/stepper/utils/kebabCase';
import { recordPageView } from 'calypso/lib/analytics/page-view';
import {
	getSignupCompleteFlowNameAndClear,
	getSignupCompleteStepNameAndClear,
} from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { isRequestingSite } from 'calypso/state/sites/selectors';

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
	flowName: string;
	stepSlug: string;
	flowVariantSlug?: string;
	skipStepRender?: boolean;
}

/**
 * Hook to track the step route in the declarative flow.
 */
export const useStepRouteTracking = ( {
	flowName,
	stepSlug,
	flowVariantSlug,
	skipStepRender,
}: Props ) => {
	const intent = useIntent();
	const design = useSelectedDesign();
	const hasRequestedSelectedSite = useHasRequestedSelectedSite();
	const stepCompleteEventPropsRef = useRef< RecordStepCompleteProps | null >( null );

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

		const signupCompleteFlowName = getSignupCompleteFlowNameAndClear();
		const signupCompleteStepName = getSignupCompleteStepNameAndClear();

		const isReEnteringStep =
			signupCompleteFlowName === flowName && signupCompleteStepName === stepSlug;

		if ( ! isReEnteringStep ) {
			recordStepStart( flowName, kebabCase( stepSlug ), {
				intent,
				is_in_hosting_flow: isAnyHostingFlow( flowName ),
				...( design && { assembler_source: getAssemblerSource( design ) } ),
				...( flowVariantSlug && { flow_variant: flowVariantSlug } ),
				skip_step_render: Boolean( skipStepRender ),
			} );

			// Apply the props to record in the exit/step-complete event. We only record this if start event gets recorded.
			stepCompleteEventPropsRef.current = {
				flow: flowName,
				step: stepSlug,
				optionalProps: { intent, skip_step_render: Boolean( skipStepRender ) },
			};

			const stepOldSlug = getStepOldSlug( stepSlug );

			if ( stepOldSlug ) {
				recordStepStart( flowName, kebabCase( stepOldSlug ), {
					intent,
					is_in_hosting_flow: isAnyHostingFlow( flowName ),
					...( design && { assembler_source: getAssemblerSource( design ) } ),
					...( flowVariantSlug && { flow_variant: flowVariantSlug } ),
					skip_step_render: Boolean( skipStepRender ),
				} );
			}
		}

		// Also record page view for data and analytics
		const pathname = window.location.pathname;
		const pageTitle = `Setup > ${ flowName } > ${ stepSlug }`;
		const params = {
			flow: flowName,
			skip_step_render: Boolean( skipStepRender ),
		};
		recordPageView( pathname, pageTitle, params );

		// We leave out intent and design from the dependency list, due to the ONBOARD_STORE being reset in the exit flow.
		// The store reset causes these values to become empty, and may trigger this event again.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ flowName, hasRequestedSelectedSite, stepSlug ] );
};
