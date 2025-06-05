import { updateLaunchpadSettings } from '@automattic/data-stores';
import { START_WRITING_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import { useLaunchpadDecider } from 'calypso/landing/stepper/declarative-flow/internals/hooks/use-launchpad-decider';
import { redirect } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/util';
import {
	type AssertConditionResult,
	AssertConditionState,
	type Flow,
	type ProvidedDependencies,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { SITE_STORE, ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { getStepFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { shouldShowLaunchpadFirst } from 'calypso/state/selectors/should-show-launchpad-first';
import { useExitFlow } from '../../../hooks/use-exit-flow';
import { useSiteData } from '../../../hooks/use-site-data';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';

const startWriting: Flow = {
	name: START_WRITING_FLOW,
	get title() {
		return translate( 'Start writing' );
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
	useTracksEventProps() {
		const site = useSite();
		const step = getStepFromURL();
		if ( site && shouldShowLaunchpadFirst( site ) && step === 'launchpad' ) {
			//prevent track events from firing until we're sure we won't redirect away from Launchpad
			return {
				isLoading: true,
				eventsProperties: {},
			};
		}

		return {
			isLoading: false,
			eventsProperties: {},
		};
	},

	useStepNavigation( currentStep, navigate ) {
		const { saveSiteSettings, setIntentOnSite } = useDispatch( SITE_STORE );
		const { setSelectedSite } = useDispatch( ONBOARD_STORE );
		const { site, siteSlug, siteId } = useSiteData();
		const { exitFlow } = useExitFlow();

		// This flow clear the site_intent when flow is completed.
		// We need to check if the site is launched and if so, clear the site_intent to avoid errors.
		// See https://github.com/Automattic/dotcom-forge/issues/2886
		const isSiteLaunched = site?.launch_status === 'launched' || false;
		useEffect( () => {
			if ( isSiteLaunched ) {
				setIntentOnSite( siteSlug, '' );
			}
		}, [ siteSlug, setIntentOnSite, isSiteLaunched ] );

		const { getPostFlowUrl, postFlowNavigator, initializeLaunchpadState } = useLaunchpadDecider( {
			exitFlow,
			navigate,
		} );

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( currentStep ) {
				case 'check-sites':
					// Check for unlaunched sites
					if ( providedDependencies?.filteredSitesCount === 0 ) {
						// No unlaunched sites, redirect to new site creation step
						return navigate( 'create-site' );
					}
					// With unlaunched sites, continue to new-or-existing-site step
					return navigate( 'new-or-existing-site' );
				case 'new-or-existing-site':
					if ( 'new-site' === providedDependencies?.newExistingSiteChoice ) {
						return navigate( 'create-site' );
					}
					return navigate( 'site-picker' );
				case 'site-picker': {
					if ( providedDependencies?.siteId && providedDependencies?.siteSlug ) {
						setSelectedSite( providedDependencies?.siteId );
						await Promise.all( [
							setIntentOnSite( providedDependencies?.siteSlug, START_WRITING_FLOW ),
							saveSiteSettings( providedDependencies?.siteId, {
								launchpad_screen: 'full',
							} ),
						] );

						const siteOrigin = window.location.origin;

						return redirect(
							`https://${ providedDependencies?.siteSlug }/wp-admin/post-new.php?` +
								`${ START_WRITING_FLOW }=true&origin=${ siteOrigin }` +
								`&postFlowUrl=${ getPostFlowUrl( {
									flow: START_WRITING_FLOW,
									siteId: providedDependencies?.siteId as string,
									siteSlug: providedDependencies?.siteSlug as string,
								} ) }`
						);
					}
				}
				case 'create-site':
					return navigate( 'processing' );
				case 'processing': {
					// If we just created a new site.
					if ( ! providedDependencies?.isLaunched && providedDependencies?.siteSlug ) {
						setSelectedSite( providedDependencies?.siteId );
						await Promise.all( [
							setIntentOnSite( providedDependencies?.siteSlug, START_WRITING_FLOW ),
							saveSiteSettings( providedDependencies?.siteId, {
								launchpad_screen: 'full',
							} ),
						] );

						initializeLaunchpadState( {
							siteId: providedDependencies?.siteId as number,
							siteSlug: providedDependencies?.siteSlug as string,
						} );

						const siteOrigin = window.location.origin;

						return redirect(
							`https://${ providedDependencies?.siteSlug }/wp-admin/post-new.php?` +
								`${ START_WRITING_FLOW }=true&origin=${ siteOrigin }` +
								`&postFlowUrl=${ getPostFlowUrl( {
									flow: START_WRITING_FLOW,
									siteId: providedDependencies?.siteId as string,
									siteSlug: providedDependencies?.siteSlug as string,
								} ) }`
						);
					}

					if ( providedDependencies?.isLaunched ) {
						// Remove the site_intent so that it doesn't affect the editor.
						await setIntentOnSite( providedDependencies?.siteSlug, '' );
						return navigate( 'celebration-step' );
					}

					if ( providedDependencies?.goToCheckout ) {
						// Do nothing and wait for checkout redirect
						return;
					}

					return postFlowNavigator( { siteId, siteSlug } );
				}
				case 'domains':
					if ( siteId ) {
						await updateLaunchpadSettings( siteId, {
							checklist_statuses: { domain_upsell_deferred: true },
						} );
					}

					if ( providedDependencies?.freeDomain ) {
						return window.location.assign( `/setup/start-writing/launchpad?siteId=${ site?.ID }` );
					}

					return navigate( 'plans' );
				case 'use-my-domain':
					if ( siteId ) {
						await updateLaunchpadSettings( siteId, {
							checklist_statuses: { domain_upsell_deferred: true },
						} );
					}
					return navigate( 'plans' );
				case 'plans':
					if ( siteId ) {
						await updateLaunchpadSettings( siteId, {
							checklist_statuses: { plan_completed: true },
						} );
					}
					return navigate( 'launchpad' );
				case 'setup-blog':
					if ( siteId ) {
						await updateLaunchpadSettings( siteId, {
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

		const goBack = async () => {
			switch ( currentStep ) {
				case 'domains':
					return navigate( 'launchpad' );
			}
		};

		const goNext = async () => {
			switch ( currentStep ) {
				case 'launchpad':
					skipLaunchpad( {
						siteId,
						siteSlug,
					} );
					return;
			}
		};

		return { goNext, goBack, submit };
	},

	useAssertConditions(): AssertConditionResult {
		const flowName = this.name;
		const isLoggedIn = useSelector( isUserLoggedIn );
		const currentUserSiteCount = useSelector( getCurrentUserSiteCount );
		const currentPath = window.location.pathname;
		const isCreateSite =
			currentPath.endsWith( 'setup/start-writing' ) ||
			currentPath.endsWith( 'setup/start-writing/' ) ||
			currentPath.includes( 'setup/start-writing/check-sites' );
		const userAlreadyHasSites = currentUserSiteCount && currentUserSiteCount > 0;

		useEffect( () => {
			if ( isLoggedIn && isCreateSite && ! userAlreadyHasSites ) {
				redirect( '/setup/start-writing/create-site' );
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

export default startWriting;
