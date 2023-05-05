import { OnboardSelect, updateLaunchpadSettings } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import {
	START_WRITING_FLOW,
	addPlanToCart,
	addProductsToCart,
	replaceProductsInCart,
} from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useSelector } from 'react-redux';
import { recordSubmitStep } from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-submit-step';
import { redirect } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/util';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';

const startWriting: Flow = {
	name: START_WRITING_FLOW,
	title: 'Blog',
	useSteps() {
		return [
			{
				slug: 'site-creation-step',
				asyncComponent: () => import( './internals/steps-repository/site-creation-step' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
			{
				slug: 'domains',
				asyncComponent: () => import( './internals/steps-repository/choose-a-domain' ),
			},
			{ slug: 'plans', asyncComponent: () => import( './internals/steps-repository/plans' ) },
			{
				slug: 'setup-blog',
				asyncComponent: () => import( './internals/steps-repository/setup-blog' ),
			},
			{
				slug: 'launchpad',
				asyncComponent: () => import( './internals/steps-repository/launchpad' ),
			},
			{
				slug: 'start-writing-done',
				asyncComponent: () => import( './internals/steps-repository/start-writing-done' ),
			},
		];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const siteSlug = useSiteSlug();
		const { getDomainCartItem, getPlanCartItem } = useSelect(
			( select ) => ( {
				getDomainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem,
				getPlanCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem,
			} ),
			[]
		);
		const planCartItem = getPlanCartItem();

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, '', flowName, currentStep );
			const returnUrl = `/setup/start-writing/start-writing-done?siteSlug=${ siteSlug }`;

			switch ( currentStep ) {
				case 'site-creation-step':
					return navigate( 'processing' );
				case 'processing': {
					// If we just created a new site.
					if ( ! providedDependencies?.blogLaunched && providedDependencies?.siteSlug ) {
						await updateLaunchpadSettings( String( providedDependencies?.siteSlug ), {
							checklist_statuses: { first_post_published: true },
						} );

						const siteOrigin = window.location.origin;

						return redirect(
							`https://${ providedDependencies?.siteSlug }/wp-admin/post-new.php?${ START_WRITING_FLOW }=true&origin=${ siteOrigin }`
						);
					}

					// If the user's site has just been launched.
					if ( providedDependencies?.blogLaunched && providedDependencies?.siteSlug ) {
						// If the user launched their site with a plan or domain in their cart, redirect them to
						// checkout before sending them home.
						if ( getPlanCartItem() || getDomainCartItem() ) {
							const encodedReturnUrl = encodeURIComponent( returnUrl );

							return window.location.assign(
								`/checkout/${ encodeURIComponent(
									( siteSlug as string ) ?? ''
								) }?redirect_to=${ encodedReturnUrl }`
							);
						}
						return window.location.replace( returnUrl );
					}
					return navigate( 'launchpad' );
				}
				case 'domains':
					if ( siteSlug ) {
						await updateLaunchpadSettings( siteSlug, {
							checklist_statuses: { domain_upsell_deferred: true },
						} );
					}

					if ( providedDependencies?.freeDomain ) {
						await replaceProductsInCart( siteSlug as string, [] );

						if ( planCartItem ) {
							await addPlanToCart( siteSlug as string, flowName as string, true, '', planCartItem );
						}
						return navigate( 'launchpad' );
					}

					return navigate( 'plans' );
				case 'plans':
					if ( siteSlug ) {
						await updateLaunchpadSettings( siteSlug, {
							checklist_statuses: { plan_completed: true, domain_upsell_deferred: true },
						} );
					}
					if ( providedDependencies?.goToCheckout ) {
						const domainCartItem = getDomainCartItem();

						// Always clear the cart before adding the plan and domain to the cart.
						await replaceProductsInCart( siteSlug as string, [] );

						if ( planCartItem ) {
							await addPlanToCart( siteSlug as string, flowName as string, true, '', planCartItem );
						}

						if ( domainCartItem ) {
							await addProductsToCart( siteSlug as string, flowName as string, [ domainCartItem ] );
						}
					}
					return navigate( 'launchpad' );
				case 'setup-blog':
					if ( siteSlug ) {
						await updateLaunchpadSettings( siteSlug, {
							checklist_statuses: { site_edited: true },
						} );
					}
					return navigate( 'launchpad' );
				case 'launchpad':
					return navigate( 'processing' );
			}
		}
		return { submit };
	},

	useAssertConditions(): AssertConditionResult {
		const flowName = this.name;
		const isLoggedIn = useSelector( isUserLoggedIn );
		const currentUserSiteCount = useSelector( getCurrentUserSiteCount );
		const locale = useLocale();
		const currentPath = window.location.pathname;
		const isSiteCreationStep =
			currentPath.endsWith( 'setup/start-writing/' ) ||
			currentPath.includes( 'setup/start-writing/site-creation-step' );
		const userAlreadyHasSites = currentUserSiteCount && currentUserSiteCount > 0;

		const logInUrl =
			locale && locale !== 'en'
				? `/start/account/user/${ locale }?variationName=${ flowName }&pageTitle=Start%20writing&redirect_to=/setup/${ flowName }`
				: `/start/account/user?variationName=${ flowName }&pageTitle=Start%20writing&redirect_to=/setup/${ flowName }`;

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! isLoggedIn ) {
			redirect( logInUrl );
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } requires a logged in user`,
			};
		} else if ( userAlreadyHasSites && isSiteCreationStep ) {
			// Redirect users with existing sites out of the flow as we create a new site as the first step in this flow.
			// This prevents a bunch of sites being created accidentally.
			redirect( `/post?${ START_WRITING_FLOW }=true` );
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } requires no preexisting sites`,
			};
		}

		return result;
	},
};

export default startWriting;
