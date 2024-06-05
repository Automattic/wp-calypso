import { updateLaunchpadSettings } from '@automattic/data-stores';
import { START_WRITING_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import { recordSubmitStep } from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-submit-step';
import { redirect } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/util';
import {
	type AssertConditionResult,
	AssertConditionState,
	type Flow,
	type ProvidedDependencies,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { SITE_STORE, ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { useSiteData } from '../hooks/use-site-data';
import { useLoginUrl } from '../utils/path';

const startWriting: Flow = {
	name: START_WRITING_FLOW,
	get title() {
		return translate( 'Blog' );
	},
	isSignupFlow: true,
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
				slug: 'create-site',
				asyncComponent: () => import( './internals/steps-repository/create-site' ),
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
		const { saveSiteSettings, setIntentOnSite } = useDispatch( SITE_STORE );
		const { setSelectedSite } = useDispatch( ONBOARD_STORE );
		const { site, siteSlug, siteId } = useSiteData();

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
							`https://${ providedDependencies?.siteSlug }/wp-admin/post-new.php?${ START_WRITING_FLOW }=true&origin=${ siteOrigin }&new_prompt=true`
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

						const siteOrigin = window.location.origin;

						return redirect(
							`https://${ providedDependencies?.siteSlug }/wp-admin/post-new.php?${ START_WRITING_FLOW }=true&origin=${ siteOrigin }&new_prompt=true`
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

					return navigate( 'launchpad' );
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
						checklistSlug: 'start-writing',
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

		const locale = useFlowLocale();

		const logInUrl = useLoginUrl( {
			variationName: flowName,
			redirectTo: `/setup/${ flowName }`,
			pageTitle: translate( 'Start writing' ),
			locale,
		} );
		// Despite sending a CHECKING state, this function gets called again with the
		// /setup/start-writing/create-site route which has no locale in the path so we need to
		// redirect off of the first render.
		// This effects both /setup/start-writing/<locale> starting points and /setup/start-writing/create-site/<locale> urls.
		// The double call also hapens on urls without locale.
		useEffect( () => {
			if ( ! isLoggedIn ) {
				redirect( logInUrl );
			} else if ( isCreateSite && ! userAlreadyHasSites ) {
				redirect( '/setup/start-writing/create-site' );
			}
		}, [] );

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! isLoggedIn ) {
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } requires a logged in user`,
			};
		} else if ( isCreateSite && ! userAlreadyHasSites ) {
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } with no preexisting sites`,
			};
		}

		return result;
	},
};

export default startWriting;
