import config from '@automattic/calypso-config';
import { AI_SITE_BUILDER_SPEC_FLOW, ONBOARDING_FLOW } from '@automattic/onboarding';
import { init as initPostHog } from '@automattic/posthog';
import { useEffect } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { STEPS } from '../../internals/steps';
import { FlowV2 } from '../../internals/types';

function initialize() {
	// Check if site-spec feature flag is enabled
	if ( ! config.isEnabled( 'site-spec' ) ) {
		// Redirect to default flow (same as Calypso's 404 behavior)
		window.location.href = `/setup/${ ONBOARDING_FLOW }${ window.location.search }`;
		return [];
	}

	// Check for spec_id parameter - if present, redirect to main ai-site-builder flow
	const queryParams = new URLSearchParams( window.location.search );
	const specId = queryParams.get( 'spec_id' );

	if ( specId ) {
		// Redirect to main ai-site-builder flow preserving query parameters
		window.location.replace( `/setup/ai-site-builder?${ queryParams.toString() }` );
		return [];
	}

	// Only show the site-spec step (with empty slug for clean URL)
	return [ STEPS.SITE_SPEC ];
}

const aiSiteBuilderSpec: FlowV2< typeof initialize > = {
	name: AI_SITE_BUILDER_SPEC_FLOW,
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	initialize,
	useSideEffect() {
		const queryParams = useQuery();
		const source = queryParams.get( 'source' );
		const currentUser = useSelector( getCurrentUser );

		useEffect( () => {
			if ( source?.startsWith( 'ciab-' ) && config.isEnabled( 'posthog-tracking' ) ) {
				initPostHog(
					config( 'ciab_posthog_api_key' ),
					currentUser ? { ID: currentUser.ID } : undefined
				);
			}
		}, [ source, currentUser ] );
	},
	useStepNavigation: () => {
		return { submit: () => {} };
	},
};

export default aiSiteBuilderSpec;
