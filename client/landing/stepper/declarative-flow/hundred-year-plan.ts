import config from '@automattic/calypso-config';
import { PLAN_100_YEARS, getPlan } from '@automattic/calypso-products';
import { UserSelect } from '@automattic/data-stores';
import { HUNDRED_YEAR_PLAN_FLOW, addProductsToCart } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { SiteId, SiteSlug } from 'calypso/types';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import { STEPS } from './internals/steps';
import type { ProvidedDependencies, Flow } from './internals/types';

const HundredYearPlanFlow: Flow = {
	name: HUNDRED_YEAR_PLAN_FLOW,
	get title() {
		return ( getPlan( PLAN_100_YEARS )?.getTitle() || '' ) as string;
	},

	isSignupFlow: true,
	useSteps() {
		const currentUser = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
			[]
		);

		const isVipFeatureEnabled = config.isEnabled( '100-year-plan/vip' );
		const hasSite = !! currentUser?.site_count;

		const steps = [
			// VIP step (conditional)
			...( isVipFeatureEnabled
				? [ STEPS.HUNDRED_YEAR_PLAN_DIY_OR_DIFM, STEPS.HUNDRED_YEAR_PLAN_THANK_YOU ]
				: [] ),

			// If the user has a site, we show them a different flow
			...( hasSite ? [ STEPS.NEW_OR_EXISTING_SITE, STEPS.HUNDRED_YEAR_PLAN_SITE_PICKER ] : [] ),
			STEPS.HUNDRED_YEAR_PLAN_SETUP,
			STEPS.DOMAINS,
			STEPS.PROCESSING,
			STEPS.SITE_CREATION_STEP,
		];

		return stepsWithRequiredLogin( steps );
	},
	useSideEffect() {
		useEffect( () => {
			clearSignupDestinationCookie();
		}, [] );
	},
	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const { setPlanCartItem, setPendingAction } = useDispatch( ONBOARD_STORE );
		const currentUser = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
			[]
		);
		const hasSite = !! currentUser?.site_count;

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			const updateCartForExistingSite = async () => {
				if ( ! providedDependencies?.siteSlug || ! providedDependencies?.siteId ) {
					return;
				}

				const siteSlug: SiteSlug = providedDependencies.siteSlug as SiteSlug;
				const siteId: SiteId = providedDependencies.siteSlug as SiteId;

				const productsToAdd = [
					{
						product_slug: PLAN_100_YEARS,
					},
				];
				await addProductsToCart( siteSlug, HUNDRED_YEAR_PLAN_FLOW, productsToAdd );

				return {
					siteId,
					siteSlug,
					goToCheckout: true,
				};
			};

			switch ( _currentStep ) {
				case 'diy-or-difm':
					if ( 'diy' === providedDependencies?.diyOrDifmChoice ) {
						return navigate( hasSite ? 'new-or-existing-site' : 'setup' );
					} else if ( providedDependencies?.nextStep === 'thank-you' ) {
						return navigate( 'thank-you' );
					}
				case 'new-or-existing-site':
					if ( 'new-site' === providedDependencies?.newExistingSiteChoice ) {
						return navigate( 'setup' );
					}
					return navigate( 'site-picker' );
				case 'site-picker':
					setPendingAction( updateCartForExistingSite );
					return navigate( 'processing' );
				case 'setup':
					return navigate( 'domains' );
				case 'domains':
					setPlanCartItem( {
						product_slug: PLAN_100_YEARS,
					} );
					return navigate( 'create-site' );
				case 'create-site':
					return navigate( 'processing' );
				case 'processing':
					if ( providedDependencies?.goToCheckout && providedDependencies?.siteSlug ) {
						setSignupCompleteSlug( providedDependencies.siteSlug );
						setSignupCompleteFlowName( flowName );

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								providedDependencies.siteSlug as string
							) }?signup=1`
						);
					}
			}
		}

		const exitFlow = ( location = '/sites' ) => {
			window.location.assign( location );
		};

		return { submit, exitFlow };
	},
};

export default HundredYearPlanFlow;
