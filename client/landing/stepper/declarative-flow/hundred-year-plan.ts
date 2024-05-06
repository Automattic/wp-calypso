import { PLAN_100_YEARS, getPlan } from '@automattic/calypso-products';
import { UserSelect } from '@automattic/data-stores';
import { HUNDRED_YEAR_PLAN_FLOW, addProductsToCart } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { SiteId, SiteSlug } from 'calypso/types';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import { useLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import {
	type AssertConditionResult,
	AssertConditionState,
	type ProvidedDependencies,
	type Flow,
} from './internals/types';

const HundredYearPlanFlow: Flow = {
	name: HUNDRED_YEAR_PLAN_FLOW,
	get title() {
		return translate( '100-year Plan' );
	},
	isSignupFlow: true,
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
					slug: 'createSite',
					asyncComponent: () => import( './internals/steps-repository/create-site' ),
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
				slug: 'createSite',
				asyncComponent: () => import( './internals/steps-repository/create-site' ),
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
		const { setPlanCartItem, setPendingAction } = useDispatch( ONBOARD_STORE );

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

	useAssertConditions() {
		const flowName = this.name;

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		const locale = useFlowLocale();

		const logInUrl = useLoginUrl( {
			variationName: flowName,
			redirectTo: `/setup/${ flowName }/setup${ locale ? `?locale=${ locale }` : '' }`,
			pageTitle: ( getPlan( PLAN_100_YEARS )?.getTitle() || '' ) as string,
			locale,
		} );

		// Send non-logged-in users to log in or create an account.
		if ( ! userIsLoggedIn ) {
			window.location.assign( logInUrl );

			result = {
				state: AssertConditionState.FAILURE,
				message: `${ flowName } requires a logged in user`,
			};
		}

		return result;
	},
};

export default HundredYearPlanFlow;
