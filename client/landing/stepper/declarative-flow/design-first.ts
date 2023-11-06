import {
	OnboardSelect,
	LaunchpadNavigator,
	updateLaunchpadSettings,
} from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { DESIGN_FIRST_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch, dispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { addQueryArgs, getQueryArg } from '@wordpress/url';
import { useSelector } from 'react-redux';
import { getLocaleFromQueryParam, getLocaleFromPathname } from 'calypso/boot/locale';
import { recordSubmitStep } from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-submit-step';
import { redirect } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/util';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { SITE_STORE, ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { freeSiteAddressType } from 'calypso/lib/domains/constants';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { requestSiteAddressChange } from 'calypso/state/site-address-change/actions';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useLoginUrl } from '../utils/path';

const designFirst: Flow = {
	name: DESIGN_FIRST_FLOW,
	title: 'Blog',
	useSteps() {
		return [
			{
				slug: 'check-sites',
				asyncComponent: () => import( './internals/steps-repository/sites-checker' ),
			},
			{
				slug: 'new-or-existing-site',
				asyncComponent: () => import( './internals/steps-repository/new-or-existing-site' ),
			},
			{
				slug: 'site-picker',
				asyncComponent: () => import( './internals/steps-repository/site-picker-list' ),
			},
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
			{
				slug: 'use-my-domain',
				asyncComponent: () => import( './internals/steps-repository/use-my-domain' ),
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
				slug: 'site-launch',
				asyncComponent: () => import( './internals/steps-repository/site-launch' ),
			},
			{
				slug: 'celebration-step',
				asyncComponent: () => import( './internals/steps-repository/celebration-step' ),
			},
		];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const siteSlug = useSiteSlug();
		const siteId = useSiteIdParam();

		const { saveSiteSettings, setIntentOnSite } = useDispatch( SITE_STORE );
		const { setSelectedSite } = useDispatch( ONBOARD_STORE );
		const state = useSelect(
			( select ) => select( ONBOARD_STORE ) as OnboardSelect,
			[]
		).getState();
		const site = useSite();
		const { setActiveChecklist } = useDispatch( LaunchpadNavigator.store );

		// This flow clear the site_intent when flow is completed.
		// We need to check if the site is launched and if so, clear the site_intent to avoid errors.
		// See https://github.com/Automattic/dotcom-forge/issues/2886
		const isSiteLaunched = site?.launch_status === 'launched' || false;
		useEffect( () => {
			if ( isSiteLaunched ) {
				setIntentOnSite( siteSlug, '' );
			}
		}, [ siteSlug, setIntentOnSite, isSiteLaunched ] );

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, '', flowName, currentStep );

			switch ( currentStep ) {
				case 'check-sites':
					// Check for unlaunched sites
					if ( providedDependencies?.filteredSitesCount === 0 ) {
						// No unlaunched sites, redirect to new site creation step
						return navigate( 'site-creation-step' );
					}
					// With unlaunched sites, continue to new-or-existing-site step
					return navigate( 'new-or-existing-site' );
				case 'new-or-existing-site':
					if ( 'new-site' === providedDependencies?.newExistingSiteChoice ) {
						return navigate( 'site-creation-step' );
					}
					return navigate( 'site-picker' );
				case 'site-picker': {
					if ( providedDependencies?.siteId && providedDependencies?.siteSlug ) {
						setSelectedSite( providedDependencies?.siteId );
						await Promise.all( [
							setIntentOnSite( providedDependencies?.siteSlug, DESIGN_FIRST_FLOW ),
							saveSiteSettings( providedDependencies?.siteId, {
								launchpad_screen: 'full',
							} ),
						] );

						return window.location.assign(
							addQueryArgs( `/setup/update-design/designSetup`, {
								siteSlug: providedDependencies?.siteSlug,
								flowToReturnTo: DESIGN_FIRST_FLOW,
								theme: getQueryArg( window.location.href, 'theme' ),
								style_variation: getQueryArg( window.location.href, 'style_variation' ),
							} )
						);
					}
					return navigate( 'launchpad' );
				}
				case 'site-creation-step':
					return navigate( 'processing' );
				case 'processing': {
					// If we just created a new site.
					const siteSlug = providedDependencies?.siteSlug;
					if ( ! providedDependencies?.blogLaunched && siteSlug ) {
						const siteId = providedDependencies?.siteId;
						setSelectedSite( siteId );
						setIntentOnSite( siteSlug, DESIGN_FIRST_FLOW );
						saveSiteSettings( siteId, {
							launchpad_screen: 'full',
						} );

						if ( providedDependencies?.hasSetPreselectedTheme ) {
							updateLaunchpadSettings( siteSlug as string, {
								checklist_statuses: { design_completed: true },
							} );

							return navigate( `launchpad?siteSlug=${ siteSlug }` );
						}

						return window.location.assign(
							addQueryArgs( `/setup/update-design/designSetup`, {
								siteSlug: siteSlug,
								flowToReturnTo: flowName,
								theme: getQueryArg( window.location.href, 'theme' ),
								style_variation: getQueryArg( window.location.href, 'style_variation' ),
							} )
						);
					}

					// If the user's site has just been launched.
					if ( providedDependencies?.blogLaunched && siteSlug ) {
						await Promise.all( [
							// We set launchpad_screen to off because users can choose to
							// complete the first_post_published checklist task or not.
							saveSiteSettings( providedDependencies?.siteSlug, {
								launchpad_screen: 'off',
							} ),
							// Remove the site_intent.
							setIntentOnSite( providedDependencies?.siteSlug, '' ),
						] );
						return navigate( 'celebration-step' );
					}
					if ( providedDependencies?.goToCheckout ) {
						// Do nothing and wait for checkout redirect
						return;
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
						const freeDomainSuffix = '.wordpress.com';
						const newDomainName = String( providedDependencies?.domainName ).replace(
							freeDomainSuffix,
							''
						);

						if ( providedDependencies?.domainName ) {
							await requestSiteAddressChange(
								site?.ID,
								newDomainName,
								'wordpress.com',
								siteSlug,
								freeSiteAddressType.BLOG,
								true,
								false
							)( dispatch, state );
						}

						const currentSiteSlug = String( providedDependencies?.domainName ?? siteSlug );

						return window.location.assign(
							`/setup/design-first/launchpad?siteSlug=${ currentSiteSlug }`
						);
					}

					return navigate( 'plans' );
				case 'use-my-domain':
					if ( siteSlug ) {
						await updateLaunchpadSettings( siteSlug, {
							checklist_statuses: { domain_upsell_deferred: true },
						} );
					}
					return navigate( 'plans' );
				case 'plans':
					if ( siteSlug ) {
						await updateLaunchpadSettings( siteSlug, {
							checklist_statuses: { plan_completed: true },
						} );
					}
					return navigate( 'launchpad' );
				case 'setup-blog':
					if ( siteSlug ) {
						await updateLaunchpadSettings( siteSlug, {
							checklist_statuses: { setup_blog: true },
						} );
					}
					return navigate( 'launchpad' );
				case 'launchpad':
					return navigate( 'processing' );
				case 'site-launch':
					return navigate( 'processing' );
				case 'celebration-step':
					return window.location.assign( providedDependencies.destinationUrl as string );
			}
		}

		const goNext = async () => {
			switch ( currentStep ) {
				case 'launchpad':
					skipLaunchpad( {
						checklistSlug: site?.options?.site_intent,
						setActiveChecklist,
						siteId,
						siteSlug,
					} );
					return;
			}
		};

		return { goNext, submit };
	},

	useAssertConditions(): AssertConditionResult {
		const flowName = this.name;
		const isLoggedIn = useSelector( isUserLoggedIn );
		const currentUserSiteCount = useSelector( getCurrentUserSiteCount );
		const currentPath = window.location.pathname;
		const isSiteCreationStep =
			currentPath.endsWith( 'setup/design-first' ) ||
			currentPath.endsWith( 'setup/design-first/' ) ||
			currentPath.includes( 'setup/design-first/check-sites' );
		const userAlreadyHasSites = currentUserSiteCount && currentUserSiteCount > 0;

		// There is a race condition where useLocale is reporting english,
		// despite there being a locale in the URL so we need to look it up manually.
		// We also need to support both query param and path suffix localized urls
		// depending on where the user is coming from.
		const useLocaleSlug = useLocale();
		// Query param support can be removed after dotcom-forge/issues/2960 and 2961 are closed.
		const queryLocaleSlug = getLocaleFromQueryParam();
		const pathLocaleSlug = getLocaleFromPathname();
		const locale = queryLocaleSlug || pathLocaleSlug || useLocaleSlug;

		const logInUrl = useLoginUrl( {
			variationName: flowName,
			redirectTo: window.location.href.replace( window.location.origin, '' ),
			pageTitle: 'Pick a design',
			locale,
		} );

		// Despite sending a CHECKING state, this function gets called again with the
		// /setup/design-first/site-creation-step route which has no locale in the path so we need to
		// redirect off of the first render.
		// This effects both /setup/design-first/<locale> starting points and /setup/design-first/site-creation-step/<locale> urls.
		// The double call also hapens on urls without locale.
		useEffect( () => {
			if ( ! isLoggedIn ) {
				redirect( logInUrl );
			} else if (
				isSiteCreationStep &&
				( ! userAlreadyHasSites || getQueryArg( window.location.href, 'ref' ) === 'calypshowcase' )
			) {
				redirect( '/setup/design-first/site-creation-step' );
			}
		}, [] );

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! isLoggedIn ) {
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } requires a logged in user`,
			};
		} else if ( isSiteCreationStep && ! userAlreadyHasSites ) {
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } with no preexisting sites`,
			};
		}

		return result;
	},
};

export default designFirst;
