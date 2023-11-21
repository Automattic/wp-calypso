import { PLAN_HOSTING_TRIAL_MONTHLY, isFreeHostingTrial } from '@automattic/calypso-products';
import { NEW_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useLayoutEffect } from 'react';
import { getQueryArgs } from 'calypso/lib/query-args';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import { useSiteSetupFlowProgress } from '../hooks/use-site-setup-flow-progress';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { Flow, ProvidedDependencies } from './internals/types';
import type { OnboardSelect, UserSelect } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import './internals/new-hosted-site-flow.scss';

const hosting: Flow = {
	name: NEW_HOSTED_SITE_FLOW,
	useSteps() {
		return [
			{
				slug: 'options',
				asyncComponent: () => import( './internals/steps-repository/site-options' ),
			},
			{ slug: 'plans', asyncComponent: () => import( './internals/steps-repository/plans' ) },
			{
				slug: 'trialAcknowledge',
				asyncComponent: () => import( './internals/steps-repository/trial-acknowledge' ),
			},
			{
				slug: 'siteCreationStep',
				asyncComponent: () => import( './internals/steps-repository/site-creation-step' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
		];
	},
	useStepNavigation( _currentStepSlug, navigate ) {
		const { setStepProgress, setSiteTitle, setPlanCartItem, setSiteGeoAffinity } =
			useDispatch( ONBOARD_STORE );
		const { siteGeoAffinity, planCartItem } = useSelect(
			( select ) => ( {
				siteGeoAffinity: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteGeoAffinity(),
				planCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
			} ),
			[]
		);

		const flowProgress = useSiteSetupFlowProgress( _currentStepSlug, 'host' );

		if ( flowProgress ) {
			setStepProgress( flowProgress );
		}

		const flowName = this.name;

		const goBack = () => {
			if ( _currentStepSlug === 'options' ) {
				return window.location.assign( '/sites?hosting-flow=true' );
			}

			if ( _currentStepSlug === 'plans' ) {
				navigate( 'options' );
			}
			if ( _currentStepSlug === 'trialAcknowledge' ) {
				navigate( 'plans' );
			}
		};

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			recordSubmitStep( providedDependencies, '', flowName, _currentStepSlug );

			switch ( _currentStepSlug ) {
				case 'options': {
					setSiteTitle( providedDependencies.siteTitle );
					setSiteGeoAffinity( providedDependencies.siteGeoAffinity );

					setPlanCartItem( {
						product_slug: planCartItem?.product_slug,
						extra: { geo_affinity: providedDependencies.siteGeoAffinity },
					} );

					return navigate( 'plans' );
				}

				case 'plans': {
					const productSlug = ( providedDependencies.plan as MinimalRequestCartProduct )
						.product_slug;

					setPlanCartItem( {
						product_slug: productSlug,
						extra: { geo_affinity: siteGeoAffinity },
					} );

					if ( isFreeHostingTrial( productSlug ) ) {
						return navigate( 'trialAcknowledge' );
					}

					return navigate( 'siteCreationStep' );
				}

				case 'trialAcknowledge': {
					return navigate( 'siteCreationStep' );
				}

				case 'siteCreationStep':
					return navigate( 'processing' );

				case 'processing': {
					// Purchasing these plans will trigger an atomic transfer, so go to stepper flow where we wait for it to complete.
					const goingAtomic =
						planCartItem?.product_slug &&
						[
							'business-bundle',
							'business-bundle-monthly',
							'ecommerce-bundle',
							'ecommerce-bundle-monthly',
							PLAN_HOSTING_TRIAL_MONTHLY,
						].includes( planCartItem.product_slug );

					const destination = goingAtomic
						? addQueryArgs( '/setup/transferring-hosted-site', {
								siteId: providedDependencies.siteId,
						  } )
						: '/home/' + providedDependencies.siteSlug;

					persistSignupDestination( destination );
					setSignupCompleteSlug( providedDependencies?.siteSlug );
					setSignupCompleteFlowName( flowName );

					if ( providedDependencies.goToCheckout ) {
						const { coupon } = getQueryArgs();

						return window.location.assign(
							addQueryArgs(
								`/checkout/${ encodeURIComponent(
									( providedDependencies?.siteSlug as string ) ?? ''
								) }`,
								{ redirect_to: destination, coupon }
							)
						);
					}

					return window.location.assign( destination );
				}
			}
		};

		return {
			goBack,
			submit,
		};
	},
	useSideEffect( currentStepSlug ) {
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE );
		const isEligible = useSelector( isUserEligibleForFreeHostingTrial );
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		useLayoutEffect( () => {
			if ( ! userIsLoggedIn ) {
				window.location.assign( '/start/hosting' );
			}

			if ( currentStepSlug === 'trialAcknowledge' && ! isEligible ) {
				window.location.assign( '/setup/new-hosted-site' );
			}
		}, [ userIsLoggedIn, isEligible, currentStepSlug ] );

		useEffect(
			() => {
				if ( currentStepSlug === undefined ) {
					resetOnboardStore();
				}
			},
			// We only need to reset the store when the flow is mounted.
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[]
		);
	},
};

export default hosting;
