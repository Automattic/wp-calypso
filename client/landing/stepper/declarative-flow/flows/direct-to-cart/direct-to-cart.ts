import { DIRECT_TO_CART_FLOW } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
import wpcom from 'calypso/lib/wp';
import {
	persistSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteSlug,
	setSignupCompleteSiteID,
} from 'calypso/signup/storageUtils';
import { useQuery } from '../../../hooks/use-query';
import { ONBOARD_STORE, SITE_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import { appendReturnSignals, buildChainedCheckoutUrl } from './build-checkout-url';
import { resolveResumability, type SitePlanStatusResult } from './resolve-resumability';
import { resumeKey, writeResumeRecord } from './resume-storage';
import { sanitizeDirectToCartRedirect } from './sanitize-redirect';
import { validateParams } from './validate-params';
import type { FlowV2, SubmitHandler } from '../../internals/types';
import type { OnboardActions, SiteActions } from '@automattic/data-stores';

interface SitePlansResponse {
	plans?: Array< { product_slug: string; is_current?: boolean } >;
}

async function fetchSitePlanStatus(
	siteSlug: string,
	plan: string
): Promise< SitePlanStatusResult > {
	const response = ( await wpcom.req.get( {
		path: `/sites/${ encodeURIComponent( siteSlug ) }/plans`,
		apiVersion: '1.3',
	} ) ) as SitePlansResponse;

	const match = response.plans?.find( ( p ) => p.product_slug === plan );
	if ( ! match ) {
		return { status: 'none' };
	}
	return { status: match.is_current ? 'active' : 'pending' };
}

async function initialize() {
	const query = new URLSearchParams( window.location.search );
	const params = validateParams( query );

	// Invalid plan short-circuit. Populate the shared error-step state and
	// route to STEPS.ERROR rather than carrying a flow-specific step.
	if ( params.invalidPlan ) {
		recordTracksEvent( 'calypso_direct_to_cart_invalid_plan', {
			plan: params.plan?.slice( 0, 64 ) ?? '',
		} );
		const siteActions = dispatch( SITE_STORE ) as SiteActions;
		siteActions.setSiteSetupError(
			__( 'Unsupported plan' ),
			__( "The plan in this link isn't available here. You can choose a plan that works for you." )
		);
		return [ STEPS.ERROR ];
	}

	// Param-validation Tracks — one event listing every invalid param.
	if ( params.invalidParams.length > 0 ) {
		recordTracksEvent( 'calypso_direct_to_cart_invalid_params', {
			param_names: params.invalidParams.join( ',' ),
		} );
	}

	const sanitizedRedirect = sanitizeDirectToCartRedirect( params.redirectTo );
	if ( params.redirectTo && ! sanitizedRedirect ) {
		let host = '';
		try {
			host = new URL( params.redirectTo ).hostname;
		} catch {
			host = '';
		}
		recordTracksEvent( 'calypso_direct_to_cart_invalid_redirect', { redirect_to_host: host } );
	}

	// Resumability — only when we have a plan.
	const resume = await resolveResumability( {
		integration: params.integration,
		contextId: params.contextId,
		plan: params.plan as string,
		fetchSitePlanStatus,
	} );

	if ( resume.kind === 'purchased' ) {
		recordTracksEvent( 'calypso_direct_to_cart_resume_purchased', {
			integration: params.integration ?? '',
			context_id_present: Boolean( params.contextId ),
		} );
		const externalRedirect = sanitizedRedirect
			? appendReturnSignals( sanitizedRedirect, resume.siteSlug )
			: `/home/${ resume.siteSlug }`;
		// replace(), not assign(): the back button shouldn't re-run the flow.
		window.location.replace( externalRedirect );
		return [];
	}

	if ( resume.kind === 'unpurchased' ) {
		recordTracksEvent( 'calypso_direct_to_cart_resume_unpurchased', {
			integration: params.integration ?? '',
			context_id_present: Boolean( params.contextId ),
		} );
		const externalRedirect = sanitizedRedirect
			? appendReturnSignals( sanitizedRedirect, resume.siteSlug )
			: null;
		const checkoutUrl = buildChainedCheckoutUrl( {
			siteSlug: resume.siteSlug,
			plan: params.plan as string,
			externalRedirect,
			coupon: params.coupon,
		} );
		// replace(), not assign(): the back button shouldn't re-run the flow.
		window.location.replace( checkoutUrl );
		return [];
	}

	if ( resume.kind === 'create' && ( resume as { apiError?: boolean } ).apiError ) {
		recordTracksEvent( 'calypso_direct_to_cart_resume_api_error', {
			integration: params.integration ?? '',
		} );
	}

	// kind=create: pre-set plan and return the normal step list.
	const onboardActions = dispatch( ONBOARD_STORE ) as OnboardActions;
	const cartProduct: MinimalRequestCartProduct = {
		product_slug: params.plan as string,
		extra: { signup_flow: DIRECT_TO_CART_FLOW },
	};
	onboardActions.setPlanCartItem( cartProduct );

	if ( params.title ) {
		onboardActions.setSiteTitle( params.title );
	}
	// TODO(integration-attribution): backend coordination needed (spec open question #2)
	// The onboard store doesn't currently expose a setter for site_source_slug. When
	// the backend confirms which field to use, wire it through here.
	if ( params.integration ) {
		// Tracks-only attribution for now (the integration value is captured in
		// signup_flow Tracks events). Site-side attribution deferred.
	}

	return stepsWithRequiredLogin( [ STEPS.SITE_CREATION_STEP, STEPS.PROCESSING, STEPS.ERROR ] );
}

const flow: FlowV2< typeof initialize > = {
	name: DIRECT_TO_CART_FLOW,
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	initialize,

	useStepNavigation( _currentStepSlug, navigate ) {
		const query = useQuery();
		const planSlug = query.get( 'plan' ) ?? '';
		const integration = query.get( 'integration' );
		const contextId = query.get( 'context_id' );

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;
			switch ( slug ) {
				case STEPS.SITE_CREATION_STEP.slug:
					return navigate( STEPS.PROCESSING.slug );

				case STEPS.PROCESSING.slug: {
					if ( providedDependencies.processingResult !== ProcessingResult.SUCCESS ) {
						return navigate( STEPS.ERROR.slug );
					}

					const { siteSlug, siteId } = providedDependencies;

					if ( ! siteSlug ) {
						recordTracksEvent( 'calypso_direct_to_cart_missing_site_slug', {} );
						logToLogstash( {
							feature: 'calypso_client',
							message: 'PROCESSING returned without siteSlug',
							severity: 'error',
							extra: { flow: DIRECT_TO_CART_FLOW },
							tags: [ 'direct_to_cart', 'calypso_direct_to_cart_missing_site_slug' ],
						} );
						return navigate( STEPS.ERROR.slug );
					}

					// Record resumability for future re-visits.
					writeResumeRecord( resumeKey( integration, contextId ), {
						siteSlug,
						plan: planSlug,
					} );

					const rawRedirect = query.get( 'redirect_to' );
					const sanitizedRedirect = sanitizeDirectToCartRedirect( rawRedirect );
					const externalRedirect = sanitizedRedirect
						? appendReturnSignals( sanitizedRedirect, siteSlug )
						: null;

					const checkoutUrl = buildChainedCheckoutUrl( {
						siteSlug,
						siteId,
						plan: planSlug,
						externalRedirect,
						coupon: query.get( 'coupon' ),
					} );

					// Persist standard signup state so post-checkout machinery has
					// what it expects.
					const outerRedirect = externalRedirect
						? addQueryArgs( '/setup/transferring-hosted-site', {
								redirect_to: externalRedirect,
						  } )
						: `/home/${ siteSlug }`;
					persistSignupDestination( outerRedirect );
					setSignupCompleteFlowName( DIRECT_TO_CART_FLOW );
					setSignupCompleteSlug( siteSlug );
					if ( siteId ) {
						setSignupCompleteSiteID( siteId );
					}

					window.location.replace( checkoutUrl );
					return;
				}

				default:
					return;
			}
		};

		return { submit };
	},
};

export default flow;
