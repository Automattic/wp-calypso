import config from '@automattic/calypso-config';
import { AI_SITE_BUILDER_SPEC_FLOW, ONBOARDING_FLOW } from '@automattic/onboarding';
import { init as initPostHog } from '@automattic/posthog';
import { useEffect } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
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
	const shouldEarlyProvisionSite = queryParams.get( 'early_provision_site' ) === '1';
	const shouldProvisionAtomicSite = queryParams.get( 'provision_target' ) === 'wpcom-atomic';
	const shouldBuildWow = queryParams.get( 'build_wow' ) === '1';
	const shouldImportBlueprint = queryParams.get( 'blueprint_archive_import' ) === '1';

	if ( specId && ! shouldEarlyProvisionSite && ! shouldProvisionAtomicSite && ! shouldBuildWow ) {
		// Redirect to main ai-site-builder flow preserving query parameters
		window.location.replace( `/setup/ai-site-builder?${ queryParams.toString() }` );
		return [];
	}

	if ( shouldBuildWow ) {
		return [ STEPS.SITE_SPEC, STEPS.SITE_GENERATION ];
	}

	// A blueprint-archive run still has minutes of work to wait on once the spec is confirmed —
	// the Atomic transfer and the archive restore. That wait belongs on the standard processing
	// screen, not behind a spec page the customer has already finished with.
	if ( shouldImportBlueprint ) {
		return [ STEPS.SITE_SPEC, STEPS.PROCESSING, STEPS.ERROR ];
	}

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
					currentUser ? { ID: currentUser.ID } : undefined,
					{
						session_recording: { maskAllInputs: false, maskTextSelector: '' },
					}
				);
			}
		}, [ source, currentUser ] );
	},
	useStepNavigation: ( currentStepSlug, navigate ) => {
		return {
			submit: ( submittedStep ) => {
				switch ( submittedStep.slug ) {
					case 'site-spec':
						// Replaced, not pushed: the spec is confirmed and its only action taken, so
						// Back belongs to whatever sent the customer here.
						return navigate( 'processing', undefined, true );

					case 'processing': {
						const result = submittedStep.providedDependencies;
						if ( ProcessingResult.SUCCESS === result.processingResult && result.redirectTo ) {
							// The hand-off leaves Calypso for the built site, so it is a location
							// change rather than a step navigation.
							window.location.assign( result.redirectTo );
							return;
						}

						// The pending action reports a failed or timed-out build by throwing, and
						// the processing step has already stashed its message for the error step.
						return navigate( 'error', undefined, true );
					}
				}
			},
		};
	},
};

export default aiSiteBuilderSpec;
