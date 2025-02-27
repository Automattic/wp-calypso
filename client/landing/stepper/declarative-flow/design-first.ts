import { updateLaunchpadSettings } from '@automattic/data-stores';
import { DESIGN_FIRST_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { addQueryArgs, getQueryArg } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useLaunchpadDecider } from 'calypso/landing/stepper/declarative-flow/internals/hooks/use-launchpad-decider';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { redirect } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/util';
import {
	type AssertConditionResult,
	AssertConditionState,
	type Flow,
	type ProvidedDependencies,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import { SITE_STORE, ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { useExitFlow } from '../hooks/use-exit-flow';
import { useSiteData } from '../hooks/use-site-data';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';

const designFirst: Flow = {
	name: DESIGN_FIRST_FLOW,
	get title() {
		return translate( 'Blog' );
	},
	isSignupFlow: true,
	useSteps() {
		return stepsWithRequiredLogin( [
			STEPS.CHECK_SITES,
			STEPS.NEW_OR_EXISTING_SITE,
			STEPS.SITE_PICKER,
			STEPS.SITE_CREATION_STEP,
			STEPS.PROCESSING,
			STEPS.DOMAINS,
			STEPS.USE_MY_DOMAIN,
			STEPS.PLANS,
			STEPS.SETUP_BLOG,
			STEPS.LAUNCHPAD,
			STEPS.SITE_LAUNCH,
			STEPS.CELEBRATION,
		] );
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const { saveSiteSettings, setIntentOnSite } = useDispatch( SITE_STORE );
		const { setSelectedSite } = useDispatch( ONBOARD_STORE );
		const { site, siteSlug, siteId } = useSiteData();
		const { exitFlow } = useExitFlow();

		const { postFlowNavigator, initializeLaunchpadState } = useLaunchpadDecider( {
			exitFlow,
			navigate,
		} );

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
			switch ( currentStep ) {
				case STEPS.CHECK_SITES.slug:
					// Check for unlaunched sites
					if ( providedDependencies?.filteredSitesCount === 0 ) {
						// No unlaunched sites, redirect to new site creation step
						return navigate( STEPS.SITE_CREATION_STEP.slug );
					}
					// With unlaunched sites, continue to new-or-existing-site step
					return navigate( STEPS.NEW_OR_EXISTING_SITE.slug );
				case STEPS.NEW_OR_EXISTING_SITE.slug:
					if ( 'new-site' === providedDependencies?.newExistingSiteChoice ) {
						return navigate( STEPS.SITE_CREATION_STEP.slug );
					}
					return navigate( STEPS.SITE_PICKER.slug );
				case STEPS.SITE_PICKER.slug: {
					if ( providedDependencies?.siteId && providedDependencies?.siteSlug ) {
						setSelectedSite( providedDependencies?.siteId );
						await Promise.all( [
							setIntentOnSite( providedDependencies?.siteSlug, DESIGN_FIRST_FLOW ),
							saveSiteSettings( providedDependencies?.siteId, {
								launchpad_screen: 'full',
							} ),
						] );

						return window.location.assign(
							addQueryArgs( `/setup/update-design/design-setup`, {
								siteSlug: providedDependencies?.siteSlug,
								flowToReturnTo: DESIGN_FIRST_FLOW,
								theme: getQueryArg( window.location.href, 'theme' ),
								style_variation: getQueryArg( window.location.href, 'style_variation' ),
							} )
						);
					}
					return navigate( STEPS.LAUNCHPAD.slug );
				}
				case STEPS.SITE_CREATION_STEP.slug:
					return navigate( STEPS.PROCESSING.slug );
				case STEPS.PROCESSING.slug: {
					// If we just created a new site.
					const siteSlug = providedDependencies?.siteSlug;
					if ( ! providedDependencies?.isLaunched && siteSlug ) {
						const siteId = providedDependencies?.siteId;
						setSelectedSite( siteId );
						setIntentOnSite( siteSlug, DESIGN_FIRST_FLOW );
						saveSiteSettings( siteId, {
							launchpad_screen: 'full',
						} );
						initializeLaunchpadState( {
							siteId: siteId as number,
							siteSlug: ( providedDependencies?.siteSlug ?? siteSlug ) as string,
						} );

						if ( providedDependencies?.hasSetPreselectedTheme ) {
							updateLaunchpadSettings( siteSlug as string, {
								checklist_statuses: { design_completed: true },
							} );

							return postFlowNavigator( {
								siteId: siteId as number,
								siteSlug: siteSlug as string,
							} );
						}

						return window.location.assign(
							addQueryArgs( `/setup/update-design/design-setup`, {
								siteSlug: siteSlug,
								flowToReturnTo: flowName,
								theme: getQueryArg( window.location.href, 'theme' ),
								style_variation: getQueryArg( window.location.href, 'style_variation' ),
							} )
						);
					}

					// If the user's site has just been launched.
					if ( providedDependencies?.isLaunched && siteSlug ) {
						await Promise.all( [
							// We set launchpad_screen to off because users can choose to
							// complete the first_post_published checklist task or not.
							saveSiteSettings( providedDependencies?.siteSlug, {
								launchpad_screen: 'off',
							} ),
							// Remove the site_intent.
							setIntentOnSite( providedDependencies?.siteSlug, '' ),
						] );
						return navigate( STEPS.CELEBRATION.slug );
					}
					if ( providedDependencies?.goToCheckout ) {
						// Do nothing and wait for checkout redirect
						return;
					}
					return navigate( STEPS.LAUNCHPAD.slug );
				}
				case STEPS.DOMAINS.slug:
					if ( siteId ) {
						await updateLaunchpadSettings( siteId, {
							checklist_statuses: { domain_upsell_deferred: true },
						} );
					}

					if ( providedDependencies?.freeDomain ) {
						return window.location.assign( `/setup/design-first/launchpad?siteId=${ site?.ID }` );
					}

					return navigate( STEPS.PLANS.slug );
				case STEPS.USE_MY_DOMAIN.slug:
					if ( siteId ) {
						await updateLaunchpadSettings( siteId, {
							checklist_statuses: { domain_upsell_deferred: true },
						} );
					}
					return navigate( STEPS.PLANS.slug );
				case STEPS.PLANS.slug:
					if ( siteId ) {
						await updateLaunchpadSettings( siteId, {
							checklist_statuses: { plan_completed: true },
						} );
					}
					return navigate( STEPS.LAUNCHPAD.slug );
				case STEPS.SETUP_BLOG.slug:
					if ( siteId ) {
						await updateLaunchpadSettings( siteId, {
							checklist_statuses: { setup_blog: true },
						} );
					}
					return navigate( STEPS.LAUNCHPAD.slug );
				case STEPS.LAUNCHPAD.slug:
					return navigate( STEPS.PROCESSING.slug );
				case STEPS.SITE_LAUNCH.slug:
					return navigate( STEPS.PROCESSING.slug );
				case STEPS.CELEBRATION.slug:
					return window.location.assign( providedDependencies.destinationUrl as string );
			}
		}

		const goNext = async () => {
			switch ( currentStep ) {
				case STEPS.LAUNCHPAD.slug:
					skipLaunchpad( {
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
		const isCreateSite =
			currentPath.endsWith( 'setup/design-first' ) ||
			currentPath.endsWith( 'setup/design-first/' ) ||
			currentPath.includes( 'setup/design-first/check-sites' );
		const userAlreadyHasSites = currentUserSiteCount && currentUserSiteCount > 0;

		// Despite sending a CHECKING state, this function gets called again with the
		// /setup/design-first/create-site route which has no locale in the path so we need to
		// redirect off of the first render.
		// This effects both /setup/design-first/<locale> starting points and /setup/design-first/create-site/<locale> urls.
		// The double call also hapens on urls without locale.
		useEffect( () => {
			if (
				isLoggedIn &&
				isCreateSite &&
				( ! userAlreadyHasSites || getQueryArg( window.location.href, 'ref' ) === 'calypshowcase' )
			) {
				redirect( `/setup/design-first/create-site${ window.location.search }` );
			}
		}, [] );

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( isLoggedIn && isCreateSite && ! userAlreadyHasSites ) {
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } with no preexisting sites`,
			};
		}

		return result;
	},
};

export default designFirst;
