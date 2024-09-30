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
import type { ProvidedDependencies, Flow } from './internals/types';

const HundredYearDomainFlow: Flow = {
	// name: HUNDRED_YEAR_PLAN_FLOW,
	name: 'hundred-year-domain',

	get title() {
		return ( getPlan( PLAN_100_YEARS )?.getTitle() || '' ) as string;
	},

	isSignupFlow: true,

	useSteps() {
		const steps = [
			{
				slug: 'domains',
				asyncComponent: () => import( './internals/steps-repository/domains' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
			{
				slug: 'createSite',
				asyncComponent: () => import( './internals/steps-repository/create-site' ),
			},
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
						product_slug: '100-year-domain', // TODO: replace by const
					},
				];
				await addProductsToCart( siteSlug, '100-year-domain', productsToAdd );

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
					}
					// TODO: add VIP flow
					return navigate( 'schedule-appointment' );
				case 'schedule-appointment':
					return navigate( 'thank-you' );
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
					return navigate( 'createSite' );
				case 'createSite':
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

		return { submit };
	},
};

export default HundredYearDomainFlow;
