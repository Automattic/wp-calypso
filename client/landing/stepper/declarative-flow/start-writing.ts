import { OnboardSelect, updateLaunchpadSettings } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { START_WRITING_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch, dispatch } from '@wordpress/data';
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
import { freeSiteAddressType } from 'calypso/lib/domains/constants';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { requestSiteAddressChange } from 'calypso/state/site-address-change/actions';

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
		const { saveSiteSettings, setIntentOnSite } = useDispatch( SITE_STORE );
		const { setSelectedSite } = useDispatch( ONBOARD_STORE );
		const state = useSelect(
			( select ) => select( ONBOARD_STORE ) as OnboardSelect,
			[]
		).getState();
		const site = useSite();

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, '', flowName, currentStep );

			switch ( currentStep ) {
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
							`https://${ providedDependencies?.siteSlug }/wp-admin/post-new.php?${ START_WRITING_FLOW }=true&origin=${ siteOrigin }`
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
