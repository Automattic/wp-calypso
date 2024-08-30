//* This hook is used to track the step route in the declarative flow.

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { SiteDetails } from '@automattic/data-stores';
import { isAnyHostingFlow } from '@automattic/onboarding';
import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { useCallback } from '@wordpress/element';
import { useEffect } from 'react';
import { STEPPER_TRACKS_EVENT_SIGNUP_STEP_START } from 'calypso/landing/stepper/constants';
import { getStepOldSlug } from 'calypso/landing/stepper/declarative-flow/helpers/get-step-old-slug';
import { getAssemblerSource } from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-design';
import { useIntent } from 'calypso/landing/stepper/hooks/use-intent';
import { useSelectedDesign } from 'calypso/landing/stepper/hooks/use-selected-design';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import kebabCase from 'calypso/landing/stepper/utils/kebabCase';
import useSnakeCasedKeys from 'calypso/landing/stepper/utils/use-snake-cased-keys';
import { recordPageView } from 'calypso/lib/analytics/page-view';
import {
	getSignupCompleteFlowNameAndClear,
	getSignupCompleteStepNameAndClear,
} from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { isRequestingSite } from 'calypso/state/sites/selectors';
import type { Flow } from 'calypso/landing/stepper/declarative-flow/internals/types';

// Ensure that the selected site is fetched, if available. This is used for event tracking purposes.
// See https://github.com/Automattic/wp-calypso/pull/82981.
const useIsRequestingSelectedSite = ( siteSlugOrId: string | number, site: SiteDetails | null ) => {
	return useSelector( ( state ) => site && isRequestingSite( state, siteSlugOrId ) );
};

interface Props {
	flow: Flow;
	stepSlug: string;
	// If true, the tracking event will not be recorded
	skipTracking: boolean;
}

/**
 * Hook to track the step route in the declarative flow.
 */
export const useStepRouteTracking = ( { flow, stepSlug, skipTracking }: Props ) => {
	const intent = useIntent();
	const design = useSelectedDesign();
	const { site, siteSlugOrId } = useSiteData();
	const isRequestingSelectedSite = useIsRequestingSelectedSite( siteSlugOrId, site );
	const hasRequestedSelectedSite = siteSlugOrId ? !! site && ! isRequestingSelectedSite : true;
	const signupStepStartProps = useSnakeCasedKeys( {
		input: flow.useTracksEventProps?.()?.[ STEPPER_TRACKS_EVENT_SIGNUP_STEP_START ],
	} );

	const recordStepStart = useCallback(
		( step: string ) => {
			recordTracksEvent( STEPPER_TRACKS_EVENT_SIGNUP_STEP_START, {
				flow: flow.name,
				step: kebabCase( step ),
				device: resolveDeviceTypeByViewPort(),
				intent,
				is_in_hosting_flow: isAnyHostingFlow( flow.name ),
				...( design && { assembler_source: getAssemblerSource( design ) } ),
				...( flow.variantSlug && { flow_variant: flow.variantSlug } ),
				...signupStepStartProps,
			} );
		},

		// We leave out intent and design from the dependency list, due to the ONBOARD_STORE being reset in the exit flow.
		// The store reset causes these values to become empty, and may trigger this event again.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ flow.name, flow.variantSlug, signupStepStartProps ]
	);

	useEffect( () => {
		// We record the event only when the step is not empty. Additionally, we should not fire this event whenever the intent is changed
		if ( ! hasRequestedSelectedSite || skipTracking ) {
			return;
		}

		const signupCompleteFlowName = getSignupCompleteFlowNameAndClear();
		const signupCompleteStepName = getSignupCompleteStepNameAndClear();

		const isReEnteringStep =
			signupCompleteFlowName === flow.name && signupCompleteStepName === stepSlug;

		if ( ! isReEnteringStep ) {
			recordStepStart( stepSlug );

			const stepOldSlug = getStepOldSlug( stepSlug );
			if ( stepOldSlug ) {
				recordStepStart( stepOldSlug );
			}
		}

		// Also record page view for data and analytics
		const pathname = window.location.pathname;
		const pageTitle = `Setup > ${ flow.name } > ${ stepSlug }`;
		recordPageView( pathname, pageTitle );
	}, [ flow.name, hasRequestedSelectedSite, stepSlug, skipTracking, recordStepStart ] );
};
