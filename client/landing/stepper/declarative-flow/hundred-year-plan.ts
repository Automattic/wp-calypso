import { PLAN_100_YEARS, getPlan } from '@automattic/calypso-products';
import { UserSelect } from '@automattic/data-stores';
import { HUNDRED_YEAR_PLAN_FLOW, addProductsToCart } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { SiteId, SiteSlug } from 'calypso/types';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import { useLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import type { ProvidedDependencies, Flow } from './internals/types';

const HundredYearPlanFlow: Flow = {
	name: HUNDRED_YEAR_PLAN_FLOW,
	get title() {
		return translate( '100-year Plan' );
	},
	useSteps() {
		const currentUser = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
			[]
		);

		if ( currentUser?.site_count ) {
			return [
				{
					slug: 'new-or-existing-site',
					asyncComponent: () => import( './internals/steps-repository/new-or-existing-site' ),
				},
				{
					slug: 'site-picker',
					asyncComponent: () =>
						import( './internals/steps-repository/hundred-year-plan-site-picker' ),
				},
				{
					slug: 'setup',
					asyncComponent: () => import( './internals/steps-repository/hundred-year-plan-setup' ),
				},
				{
					slug: 'domains',
					asyncComponent: () => import( './internals/steps-repository/domains' ),
				},
				{
					slug: 'processing',
					asyncComponent: () => import( './internals/steps-repository/processing-step' ),
				},

				{
					slug: 'siteCreationStep',
					asyncComponent: () => import( './internals/steps-repository/site-creation-step' ),
				},
			];
		}

		return [
			{
				slug: 'setup',
				asyncComponent: () => import( './internals/steps-repository/hundred-year-plan-setup' ),
			},
			{
				slug: 'domains',
				asyncComponent: () => import( './internals/steps-repository/domains' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},

			{
				slug: 'siteCreationStep',
				asyncComponent: () => import( './internals/steps-repository/site-creation-step' ),
			},
		];
	},
	useSideEffect() {
		useEffect( () => {
			clearSignupDestinationCookie();
		}, [] );
	},
	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const { setPlanCartItem, setPendingAction } = useDispatch( ONBOARD_STORE );

		const logInUrl = useLoginUrl( {
			variationName: flowName,
			redirectTo: `/setup/${ flowName }/setup`,
			pageTitle: ( getPlan( PLAN_100_YEARS )?.getTitle() || '' ) as string,
		} );

		// Send non-logged-in users to account screen.
		if ( ! userIsLoggedIn ) {
			window.location.assign( logInUrl );
		}

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, '', flowName, _currentStep );

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
					return navigate( 'siteCreationStep' );
				case 'siteCreationStep':
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

export default HundredYearPlanFlow;
