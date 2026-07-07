import { clearStepPersistedState, EDUCATION_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs, getQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { pathToUrl } from 'calypso/lib/url';
import {
	clearSignupCompleteFlowName,
	clearSignupCompleteSiteID,
	clearSignupCompleteSlug,
	clearSignupDestinationCookie,
	persistSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteSiteID,
	setSignupCompleteSlug,
} from 'calypso/signup/storageUtils';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { useFlowLocale } from '../../../hooks/use-flow-locale';
import { useQuery } from '../../../hooks/use-query';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { withLocale } from '../../helpers/with-locale';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import type { FlowV2, SubmitHandler } from '../../internals/types';
import type { DomainSuggestion } from '@automattic/api-core';
import type { OnboardActions, OnboardSelect } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

export const STUDENT_PLAN_SLUG = 'wp_bundle_student_yearly';

function initialize() {
	const steps = [
		STEPS.EDUCATION_STUDENT_VALIDATION,
		STEPS.DOMAIN_SEARCH,
		STEPS.USE_MY_DOMAIN,
		STEPS.SITE_CREATION_STEP,
		STEPS.PROCESSING,
		STEPS.ERROR,
	];

	return stepsWithRequiredLogin( steps );
}

const education: FlowV2< typeof initialize > = {
	name: EDUCATION_FLOW,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: true,
	initialize,
	useStepNavigation( currentStepSlug, navigate ) {
		const flowName = this.name;
		const locale = useFlowLocale();
		const coupon = useQuery().get( 'coupon' );
		const {
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setPlanCartItem,
			setSignupDomainOrigin,
			setSiteUrl,
		} = useDispatch( ONBOARD_STORE ) as OnboardActions;

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case STEPS.EDUCATION_STUDENT_VALIDATION.slug: {
					if ( ! providedDependencies?.inviteCodeValidated ) {
						throw new Error( 'Education invite code must be validated before continuing' );
					}

					setPlanCartItem( { product_slug: STUDENT_PLAN_SLUG } );
					return navigate( STEPS.DOMAIN_SEARCH.slug );
				}

				case STEPS.DOMAIN_SEARCH.slug: {
					if ( ! providedDependencies ) {
						throw new Error( 'No provided dependencies found' );
					}

					if ( providedDependencies.navigateToUseMyDomain ) {
						const currentQueryArgs = getQueryArgs( window.location.href );

						const useMyDomainURL = addQueryArgs( STEPS.USE_MY_DOMAIN.slug, {
							...currentQueryArgs,
							initialQuery: providedDependencies.lastQuery,
						} );

						return navigate( useMyDomainURL as typeof currentStepSlug );
					}

					setSiteUrl( providedDependencies.siteUrl as string );
					setDomain( providedDependencies.suggestion as DomainSuggestion );
					setDomainCartItem( providedDependencies.domainItem as MinimalRequestCartProduct );
					setDomainCartItems( providedDependencies.domainCart as MinimalRequestCartProduct[] );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin as string );
					setSignupCompleteFlowName( flowName );

					return navigate( STEPS.SITE_CREATION_STEP.slug, undefined, false );
				}

				case STEPS.USE_MY_DOMAIN.slug: {
					if (
						providedDependencies &&
						'mode' in providedDependencies &&
						providedDependencies.mode &&
						providedDependencies.domain
					) {
						const destination = addQueryArgs( '/use-my-domain', {
							...getQueryArgs( window.location.href ),
							step: providedDependencies.mode,
							initialQuery: providedDependencies.domain,
						} );
						return navigate( destination as typeof currentStepSlug );
					}

					if ( providedDependencies && 'skipToPlan' in providedDependencies ) {
						setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN );
						setSignupCompleteFlowName( flowName );
						return navigate( STEPS.SITE_CREATION_STEP.slug, undefined, false );
					}

					if ( ! providedDependencies || ! ( 'domainCartItem' in providedDependencies ) ) {
						throw new Error( 'No domain cart item found' );
					}

					setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN );
					setDomainCartItem( providedDependencies.domainCartItem );
					setSignupCompleteFlowName( flowName );

					return navigate( STEPS.SITE_CREATION_STEP.slug, undefined, false );
				}

				case STEPS.SITE_CREATION_STEP.slug:
					return navigate( STEPS.PROCESSING.slug, undefined, true );

				case STEPS.PROCESSING.slug: {
					// No pending action — the user refreshed or landed on this page
					// directly. Send them back to create-site so it can set up the
					// pending action and advance the flow normally.
					if ( providedDependencies.processingResult === ProcessingResult.NO_ACTION ) {
						return navigate( STEPS.SITE_CREATION_STEP.slug );
					}

					if ( providedDependencies.processingResult !== ProcessingResult.SUCCESS ) {
						return navigate( STEPS.ERROR.slug );
					}

					const siteSlug = providedDependencies.siteSlug as string | undefined;
					const siteId = providedDependencies.siteId as number | undefined;

					if ( ! siteSlug ) {
						return navigate( STEPS.ERROR.slug );
					}

					const destination = addQueryArgs( `/home/${ siteSlug }`, { ref: flowName } );
					const checkoutBackUrl = addQueryArgs(
						withLocale( `/setup/${ flowName }/${ STEPS.DOMAIN_SEARCH.slug }`, locale ),
						{
							siteSlug,
						}
					);

					persistSignupDestination( destination );
					setSignupCompleteFlowName( flowName );
					setSignupCompleteSlug( siteSlug );

					if ( siteId ) {
						setSignupCompleteSiteID( siteId );
					}

					if ( providedDependencies.goToCheckout ) {
						return window.location.replace(
							addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }`, {
								redirect_to: destination,
								signup: 1,
								checkoutBackUrl: pathToUrl( checkoutBackUrl ),
								coupon: coupon ?? undefined,
							} )
						);
					}

					return window.location.replace( destination );
				}
			}
		};

		return { submit };
	},
	useSideEffect( currentStepSlug, navigate ) {
		const reduxDispatch = useReduxDispatch();
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE ) as OnboardActions;
		const planCartItem = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
			[]
		);

		// Reset only at the flow root, not in `initialize`: the latter re-runs on
		// every boot (including a mid-flow refresh) and would wipe the persisted
		// Student plan, silently downgrading the user to a free site.
		useEffect( () => {
			if ( ! currentStepSlug ) {
				resetOnboardStore();
				reduxDispatch( setSelectedSiteId( null ) );
				clearStepPersistedState( EDUCATION_FLOW );
				clearSignupDestinationCookie();
				clearSignupCompleteFlowName();
				clearSignupCompleteSlug();
				clearSignupCompleteSiteID();
			}
		}, [ currentStepSlug, reduxDispatch, resetOnboardStore ] );

		// No Student plan in the cart on a later step means the user deep-linked
		// past validation — send them back to the start.
		useEffect( () => {
			const stepsRequiringValidation: string[] = [
				STEPS.DOMAIN_SEARCH.slug,
				STEPS.USE_MY_DOMAIN.slug,
				STEPS.SITE_CREATION_STEP.slug,
				STEPS.PROCESSING.slug,
				STEPS.ERROR.slug,
			];

			if (
				currentStepSlug &&
				stepsRequiringValidation.includes( currentStepSlug ) &&
				planCartItem?.product_slug !== STUDENT_PLAN_SLUG
			) {
				navigate( STEPS.EDUCATION_STUDENT_VALIDATION.slug );
			}
		}, [ currentStepSlug, planCartItem, navigate ] );
	},
};

export default education;
