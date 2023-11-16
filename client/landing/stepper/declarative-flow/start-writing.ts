import {
	LaunchpadNavigator,
	OnboardSelect,
	updateLaunchpadSettings,
} from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { START_WRITING_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch, dispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { getLocaleFromQueryParam, getLocaleFromPathname } from 'calypso/boot/locale';
import { recordSubmitStep } from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-submit-step';
import { redirect } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/util';
import {
	type AssertConditionResult,
	AssertConditionState,
	type Flow,
	type ProvidedDependencies,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { SITE_STORE, ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { freeSiteAddressType } from 'calypso/lib/domains/constants';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { requestSiteAddressChange } from 'calypso/state/site-address-change/actions';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useLoginUrl } from '../utils/path';

const startWriting: Flow = {
	name: START_WRITING_FLOW,
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
				case 'site-creation-step':
					return navigate( 'processing' );
				case 'processing': {
					// If we just created a new site.
					if ( ! providedDependencies?.blogLaunched && providedDependencies?.siteSlug ) {
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

					if ( providedDependencies?.blogLaunched ) {
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
							`/setup/start-writing/launchpad?siteSlug=${ currentSiteSlug }`
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
						checklistSlug: 'start-writing',
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
			currentPath.endsWith( 'setup/start-writing' ) ||
			currentPath.endsWith( 'setup/start-writing/' ) ||
			currentPath.includes( 'setup/start-writing/check-sites' );
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
			redirectTo: `/setup/${ flowName }`,
			pageTitle: 'Start writing',
			locale,
		} );
		// Despite sending a CHECKING state, this function gets called again with the
		// /setup/start-writing/site-creation-step route which has no locale in the path so we need to
		// redirect off of the first render.
		// This effects both /setup/start-writing/<locale> starting points and /setup/start-writing/site-creation-step/<locale> urls.
		// The double call also hapens on urls without locale.
		useEffect( () => {
			if ( ! isLoggedIn ) {
				redirect( logInUrl );
			} else if ( isSiteCreationStep && ! userAlreadyHasSites ) {
				redirect( '/setup/start-writing/site-creation-step' );
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

export default startWriting;
