//* This hook is used to track the step route in the declarative flow.

import { SiteDetails } from '@automattic/data-stores';
import { isAnyHostingFlow } from '@automattic/onboarding';
import { useEffect } from 'react';
import { getStepOldSlug } from 'calypso/landing/stepper/declarative-flow/helpers/get-step-old-slug';
import { getAssemblerSource } from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-design';
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

// Ensure that the selected site is fetched, if available. This is used for event tracking purposes.
// See https://github.com/Automattic/wp-calypso/pull/82981.
const useIsRequestingSelectedSite = ( siteSlugOrId: string | number, site: SiteDetails | null ) => {
	return useSelector( ( state ) => site && isRequestingSite( state, siteSlugOrId ) );
};

interface Props {
	flowName: string;
	stepSlug: string;
	// If true, the tracking event will not be recorded
	skipTracking: boolean;
	flowVariantSlug?: string;
}

/**
 * Hook to track the step route in the declarative flow.
 */
export const useStepRouteTracking = ( {
	flowName,
	stepSlug,
	skipTracking,
	flowVariantSlug,
}: Props ) => {
	const intent = useIntent();
	const design = useSelectedDesign();
	const { site, siteSlugOrId } = useSiteData();
	const isRequestingSelectedSite = useIsRequestingSelectedSite( siteSlugOrId, site );
	const hasRequestedSelectedSite = siteSlugOrId ? !! site && ! isRequestingSelectedSite : true;

	useEffect( () => {
		// We record the event only when the step is not empty. Additionally, we should not fire this event whenever the intent is changed
		if ( ! hasRequestedSelectedSite || skipTracking ) {
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
			} );

			const stepOldSlug = getStepOldSlug( stepSlug );

			if ( stepOldSlug ) {
				recordStepStart( flowName, kebabCase( stepOldSlug ), {
					intent,
					is_in_hosting_flow: isAnyHostingFlow( flowName ),
					...( design && { assembler_source: getAssemblerSource( design ) } ),
					...( flowVariantSlug && { flow_variant: flowVariantSlug } ),
				} );
			}
		}

		// Also record page view for data and analytics
		const pathname = window.location.pathname;
		const pageTitle = `Setup > ${ flowName } > ${ stepSlug }`;
		recordPageView( pathname, pageTitle );

		// We leave out intent and design from the dependency list, due to the ONBOARD_STORE being reset in the exit flow.
		// The store reset causes these values to become empty, and may trigger this event again.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ flowName, hasRequestedSelectedSite, stepSlug, skipTracking ] );
};
