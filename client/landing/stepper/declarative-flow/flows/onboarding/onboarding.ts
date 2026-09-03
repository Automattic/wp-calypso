import { isEnabled } from '@automattic/calypso-config';
import { OnboardActions, OnboardSelect } from '@automattic/data-stores';
import { getLanguageSlugs } from '@automattic/i18n-utils';
import { clearStepPersistedState, ONBOARDING_FLOW, SITE_SETUP_FLOW } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { resolveSelect, useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs, getQueryArg, getQueryArgs } from '@wordpress/url';
import { useEffect, useMemo } from 'react';
import { clearSessionStorageQuery } from 'calypso/components/domains/wpcom-domain-search/use-query-handler';
import {
	STEPPER_TRACKS_EVENT_SIGNUP_START,
	WOO_HOSTING_SOLUTIONS_REF,
} from 'calypso/landing/stepper/constants';
import {
	getLaunchpadPersonalizationDestination,
	resolveLaunchpadPersonalizationVariation,
	type LaunchpadPersonalizationVariation,
} from 'calypso/lib/ai-launchpad';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { addSurvicate } from 'calypso/lib/analytics/survicate';
import { loadExperimentAssignment } from 'calypso/lib/explat';
import { pathToUrl } from 'calypso/lib/url';
import {
	persistSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteSlug,
	clearSignupCompleteSlug,
	clearSignupCompleteFlowName,
	clearSignupDestinationCookie,
	clearSignupCompleteSiteID,
} from 'calypso/signup/storageUtils';
import { useSelector, useDispatch as useReduxDispatch } from 'calypso/state';
import { getCurrentUser, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { State } from '../../../../../../packages/data-stores/src/plans/reducer';
import { isPlanProductFree } from '../../../../../../packages/data-stores/src/plans/selectors';
import { useFlowLocale } from '../../../hooks/use-flow-locale';
import { useQuery } from '../../../hooks/use-query';
import { ONBOARD_STORE, SITE_STORE } from '../../../stores';
import {
	getBlueprintArchiveSiteSpecUrl,
	getStandaloneBlueprintArchiveSlug,
} from '../../../utils/blueprint-archive-import';
import {
	getBuildWowSiteIdentifier,
	getBuildWowSiteSpecUrl,
	logBuildWowEvent,
	requestBuildWowSite,
} from '../../../utils/build-wow';
import { goToCheckout } from '../../../utils/checkout';
import { getCurrentQueryParams } from '../../../utils/get-current-query-params';
import { getStepFromURL } from '../../../utils/get-flow-from-url';
import {
	getPreselectedPlan,
	getPreselectedStorageAddOn,
	shouldSkipPlansStep,
} from '../../../utils/preselected-plan';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import {
	clearWowFunnelSite,
	getRememberedWowFunnelSite,
	getWowFunnelArgs,
	getWowFunnelConfig,
	getWowFunnelDest,
	getWowFunnelFromWfm,
	getWowFunnelSlug,
	isKnownWowFunnel,
	logWowFunnelEvent,
	wowFunnelSiteIsPaid,
} from '../../../utils/wow-funnel';
import {
	adoptWowFunnelSite,
	fetchPendingWowFunnelSite,
	forgetWowFunnelRun,
	startWowFunnelSite,
	wowFunnelSiteHasCartItems,
} from '../../../utils/wow-funnel-site';
import { getOnboardingPostCheckoutDestination } from '../../helpers/get-onboarding-post-checkout-destination';
import { withLocale } from '../../helpers/with-locale';
import { usePurchasePlanNotification } from '../../internals/hooks/use-purchase-plan-notification';
import { STEPS } from '../../internals/steps';
import { useIsPostPlanSelectionEmailVerification } from '../../internals/steps-repository/__user/use-email-verification-gate';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import { type FlowV2, type ProvidedDependencies, type SubmitHandler } from '../../internals/types';
import {
	getOnboardingStepperPosition,
	ONBOARDING_OMITTED_PLANS_GROUP,
	ONBOARDING_STEPPER_OMITTED_GROUP_PARAM,
} from './step-counter-config';
import type { WowFunnelDest } from '../../../utils/wow-funnel';
import type { DomainSuggestion } from '@automattic/api-core';
import type { Store } from 'redux';

/**
 * Where a funnel run lands once it is paid for.
 *
 * Shared by the ordinary run — where it becomes checkout's `redirect_to` — and by a resumed one,
 * which hands the same URL to checkout itself. The two must not drift: a resumed purchase that
 * lost this would end up on My Home rather than on the site the funnel just built.
 * @param options               Options.
 * @param options.funnelSlug    The funnel being run.
 * @param options.dest          Where the CTA asked to land.
 * @param options.siteSlug      The funnel site's slug.
 * @param options.siteId        The funnel site's blog ID.
 * @param options.blueprintSlug Blueprint being built, for the site-spec hand-off.
 * @param options.ref           Referrer to carry through.
 * @param options.locale        Flow locale.
 * @returns The URL to land on after checkout.
 */
function getWowFunnelPostCheckoutDestination( {
	funnelSlug,
	dest,
	siteSlug,
	siteId,
	blueprintSlug,
	ref,
	locale,
}: {
	funnelSlug: string;
	dest: WowFunnelDest;
	siteSlug: string;
	siteId: number;
	blueprintSlug?: string | null;
	ref?: string | null;
	locale: string;
} ): string {
	const { interstitials } = getWowFunnelConfig( funnelSlug );

	// site-spec: the funnel's follow-up (e.g. the blueprint import) is already running
	// server-side, so site-spec only waits on it and hands over. It must not start one — see the
	// funnel guard on its kickoff effect.
	if ( interstitials.includes( 'site-spec' ) ) {
		return getBlueprintArchiveSiteSpecUrl( {
			siteSlug,
			siteId,
			blueprintSlug: blueprintSlug ?? '',
			ref,
			wowFunnel: funnelSlug,
		} );
	}

	// Hand off through the funnel's own post-checkout page rather than pointing checkout straight
	// at the built site: the readiness wait has to be on a page the customer reaches after paying.
	return addQueryArgs(
		withLocale( `/setup/${ ONBOARDING_FLOW }/${ STEPS.WOW_FUNNEL_HANDOFF.slug }`, locale ),
		{
			wow_funnel: funnelSlug,
			dest,
			siteSlug,
			// Skip siteId when it's 0/falsy: "0" in the URL poisons the site lookup.
			...( siteId ? { siteId } : {} ),
		}
	);
}

/**
 * Put a customer who already has an unpaid funnel site back where they stopped.
 *
 * Runs in initialize, which is awaited before the flow renders anything, so a resumed customer
 * never sees a step flash past on the way to their cart. Returning true means a redirect is under
 * way and the flow must not start.
 *
 * Only the bare flow URL is a resume: a CTA click arrives with no step in the path, while working
 * through the run — or refreshing inside it — always carries one, and bouncing those would throw
 * the customer out of the step they are on.
 * @param reduxStore The Calypso store, for the logged-in check and the locale.
 * @returns True when the customer is being redirected and the flow should not render.
 */
async function resumeWowFunnelRun( reduxStore: Store ): Promise< boolean > {
	if ( getStepFromURL() ) {
		return false;
	}

	const queryParams = new URLSearchParams( window.location.search );
	const funnelSlug = getWowFunnelSlug( queryParams );
	if ( ! isKnownWowFunnel( funnelSlug ) || ! isUserLoggedIn( reduxStore.getState() ) ) {
		return false;
	}

	const funnelArgs = getWowFunnelArgs( queryParams );

	// Ask the server, not this browser. sessionStorage remembers the run only in the tab that
	// started it, and it is the customer coming back that this exists to catch. The server drops
	// its pointer as it reads it, so a site since paid for or reverted answers "none" here and a
	// fresh run begins.
	const pending = await fetchPendingWowFunnelSite();
	if ( ! pending ) {
		return false;
	}

	// Adopt before redirecting, so create-site consumes this site rather than asking for one the
	// server will refuse. When the adoption cannot be stored there is nowhere to record that the
	// resume happened, and every entry would resume all over again — so let the flow start and let
	// create-site's own throttle fallback reach the same site.
	if ( ! adoptWowFunnelSite( pending, funnelSlug, funnelArgs ) ) {
		logWowFunnelEvent( 'resume_not_remembered', {
			funnel: funnelSlug,
			blog_id: pending.blogId,
		} );
		return false;
	}

	if ( pending.funnelSlug !== funnelSlug ) {
		// A different CTA. The throttle holds regardless of which one, so the unpaid site still
		// wins — worth seeing, since what gets resumed is not what this CTA asked to build.
		logWowFunnelEvent( 'resumed_across_funnels', {
			funnel: funnelSlug,
			pending_funnel: pending.funnelSlug,
			blog_id: pending.blogId,
		} );
	}

	const locale = getCurrentLocaleSlug( reduxStore.getState() ) || '';
	const [ , plansUrl ] = getOnboardingPostCheckoutDestination( {
		flowName: ONBOARDING_FLOW,
		locale,
		siteSlug: pending.siteSlug,
	} );

	// Something in the cart means they reached checkout and did not pay, so show them exactly
	// that. An empty one means they never picked a plan.
	if ( await wowFunnelSiteHasCartItems( pending.blogId ) ) {
		logWowFunnelEvent( 'resumed_at_checkout', {
			funnel: funnelSlug,
			blog_id: pending.blogId,
		} );

		// goToCheckout persists the post-checkout destination, which flow entry clears on its way
		// in — without it a resumed purchase would land on My Home instead of the site the funnel
		// built.
		goToCheckout( {
			flowName: ONBOARDING_FLOW,
			stepName: 'plans',
			siteSlug: pending.siteSlug,
			destination: getWowFunnelPostCheckoutDestination( {
				funnelSlug,
				dest: getWowFunnelDest( queryParams, funnelSlug ),
				siteSlug: pending.siteSlug,
				siteId: pending.blogId,
				blueprintSlug: queryParams.get( 'blueprint' ),
				ref: queryParams.get( 'ref' ),
				locale,
			} ),
		} );
		return true;
	}

	logWowFunnelEvent( 'resumed_at_plans', {
		funnel: funnelSlug,
		blog_id: pending.blogId,
	} );

	// Carry the entry URL's own params, so the resumed run stays a funnel run: wow_funnel, dest
	// and the funnel args all still have work to do downstream.
	window.location.assign( addQueryArgs( plansUrl, getQueryArgs( window.location.href ) ) );

	return true;
}

async function initialize( reduxStore: Store ) {
	// Before anything renders: a customer with an unpaid funnel site is sent back to it, and the
	// flow is killed rather than started behind the redirect.
	if ( await resumeWowFunnelRun( reduxStore ) ) {
		return false as const;
	}

	const steps = [
		STEPS.DOMAIN_SEARCH,
		STEPS.USE_MY_DOMAIN,
		STEPS.UNIFIED_PLANS,
		STEPS.EMAIL_VERIFICATION,
		STEPS.SITE_CREATION_STEP,
		STEPS.PROCESSING,
		STEPS.POST_CHECKOUT_ONBOARDING,
		STEPS.WOW_FUNNEL_HANDOFF,
		STEPS.SETUP_YOUR_SITE_AI,
	];

	return [ ...stepsWithRequiredLogin( steps ), STEPS.PLAYGROUND, STEPS.BLUEPRINT, STEPS.ERROR ];
}

const onboarding: FlowV2< typeof initialize > = {
	name: ONBOARDING_FLOW,
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	initialize,
	useTracksEventProps() {
		const query = useQuery();
		const preselectedPlan = getPreselectedPlan( query );
		// Reported raw, as the legacy flows reported their declared query dependencies.
		const couponParam = preselectedPlan ? query.get( 'coupon' ) : null;
		const storageParam = preselectedPlan ? query.get( 'storage' ) : null;

		// A new object each render would record a new signup start, so this has to be memoised.
		return useMemo(
			() => ( {
				isLoading: false,
				// The redirect collapses the plan flows' `flow` values into `onboarding`. This
				// is how that traffic stays separable.
				eventsProperties: preselectedPlan
					? {
							[ STEPPER_TRACKS_EVENT_SIGNUP_START ]: {
								preselected_plan: preselectedPlan,
								...( couponParam ? { coupon: couponParam } : {} ),
								...( storageParam ? { storage: storageParam } : {} ),
							},
					  }
					: {},
			} ),
			[ preselectedPlan, couponParam, storageParam ]
		);
	},
	useStepNavigation( currentStepSlug, navigate ) {
		const flowName = this.name;
		// Variant B: the account step doesn't gate; the verification step is met after the free plan
		// selection or, for a paid order, on return from checkout.
		const postPlanSelectionEmailVerification = useIsPostPlanSelectionEmailVerification( flowName );

		const {
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setPlanCartItem,
			setProductCartItems,
			setSiteUrl,
			setSignupDomainOrigin,
			setHideFreePlan,
		} = useDispatch( ONBOARD_STORE ) as OnboardActions;
		const locale = useFlowLocale();
		const { signupDomainOrigin, planCartItem, blueprint } = useSelect(
			( select ) => ( {
				signupDomainOrigin: ( select( ONBOARD_STORE ) as OnboardSelect ).getSignupDomainOrigin(),
				planCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
				blueprint: ( select( ONBOARD_STORE ) as OnboardSelect ).getBlueprint(),
			} ),
			[]
		);
		const queryParams = useQuery();
		const skipsPlans = shouldSkipPlansStep( queryParams, planCartItem );
		const coupon = queryParams.get( 'coupon' );
		const refParameter = queryParams.get( 'ref' );
		const diyLaunchpad = queryParams.get( 'diy-launchpad' );
		const siteSlugParam = queryParams.get( 'siteSlug' );

		const { setShouldShowNotification } = usePurchasePlanNotification();

		const playgroundId = queryParams.get( 'playground' );
		const buildDest = queryParams.get( 'build_dest' );
		const blueprintArchiveSlug = getStandaloneBlueprintArchiveSlug(
			blueprint,
			playgroundId,
			buildDest
		);
		const wowFunnelSlug = getWowFunnelSlug( queryParams );
		const wowFunnelDest = getWowFunnelDest( queryParams, wowFunnelSlug );

		/**
		 * Returns [destination, backDestination] for the post-checkout destination.
		 */
		const getPostCheckoutDestination = async (
			providedDependencies: ProvidedDependencies,
			planCartItem: MinimalRequestCartProduct | null,
			launchpadPersonalizationVariation: LaunchpadPersonalizationVariation
		): Promise< [ string, string | null, string | null ] > => {
			// Every funnel ends on the built site. A funnel with Calypso-side work hops to that
			// interstitial first; the interstitial owns the readiness wait and the hand-off, via
			// the same helpers used below, so a funnel's terminal behaviour is identical either
			// way. A funnel with no interstitials waits and hands over right here.
			if ( isKnownWowFunnel( wowFunnelSlug ) ) {
				const siteSlug = providedDependencies.siteSlug as string;
				const siteId = providedDependencies.siteId as number;

				// The run is over. Without this the remembered site outlives it for the whole
				// browser session, and the next CTA click resumes this site instead of building
				// a new one — offering a renewal of the plan just bought for it.
				clearWowFunnelSite();

				logWowFunnelEvent( 'post_checkout_handoff', {
					funnel: wowFunnelSlug,
					blog_id: siteId,
					dest: wowFunnelDest,
				} );

				return [
					getWowFunnelPostCheckoutDestination( {
						funnelSlug: wowFunnelSlug,
						dest: wowFunnelDest,
						siteSlug,
						siteId,
						blueprintSlug: queryParams.get( 'blueprint' ),
						ref: refParameter,
						locale,
					} ),
					null,
					null,
				];
			}

			if ( ! providedDependencies.hasExternalTheme && providedDependencies.hasPluginByGoal ) {
				return [ `/home/${ providedDependencies.siteSlug }`, null, null ];
			}

			if ( playgroundId || blueprint ) {
				// Check if the user selected the free plan
				const isFree =
					! planCartItem || isPlanProductFree( {} as unknown as State, planCartItem?.product_id );

				if ( isFree && playgroundId ) {
					// Redirect free plan users to a home page
					return [ `/home/${ providedDependencies.siteSlug }`, null, null ];
				}

				const params: Record< string, string | number > = {
					siteSlug: providedDependencies.siteSlug as string,
					siteId: providedDependencies.siteId as number,
				};

				// build_dest=wow: skip the Playground-based importer and land on the AI
				// site-spec, which kicks off the background transfer-to-Atomic +
				// blueprint-archive import and, on confirm, polls the import and
				// redirects to the Site Editor. The blueprint step already verified the
				// archive exists (and stripped build_dest when it does not).
				if ( blueprintArchiveSlug ) {
					return [
						getBlueprintArchiveSiteSpecUrl( {
							siteSlug: providedDependencies.siteSlug as string,
							siteId: providedDependencies.siteId as number,
							blueprintSlug: blueprintArchiveSlug,
							ref: refParameter,
						} ),
						null,
						null,
					];
				}

				if ( playgroundId ) {
					params.playground = playgroundId;
				} else if ( blueprint ) {
					params.blueprint = blueprint;
				}

				return [
					addQueryArgs( withLocale( '/setup/site-setup/importerPlayground', locale ), params ),
					null,
					null,
				];
			}

			if ( refParameter === WOO_HOSTING_SOLUTIONS_REF && providedDependencies.siteSlug ) {
				const siteSlug = providedDependencies.siteSlug as string;
				const site = await resolveSelect( SITE_STORE ).getSite( siteSlug );
				const adminUrl = site?.options?.admin_url ?? `https://${ siteSlug }/wp-admin/`;
				return [ `${ adminUrl }admin.php?page=wc-admin`, null, null ];
			}

			// Launchpad-personalization treatments replace only the default My Home landing:
			// ai_launchpad lands in Site Setup, no_guidance on the wp-admin dashboard. The
			// functional handoffs above (plugin install, playground/blueprint import, Woo)
			// keep their destinations regardless of the assigned variation.
			if ( launchpadPersonalizationVariation !== 'control' && providedDependencies.siteSlug ) {
				const siteSlug = providedDependencies.siteSlug as string;
				const site = await resolveSelect( SITE_STORE ).getSite( siteSlug );
				const adminUrl = site?.options?.admin_url ?? `https://${ siteSlug }/wp-admin/`;
				const destination = getLaunchpadPersonalizationDestination( {
					variation: launchpadPersonalizationVariation,
					adminUrl,
					enableAiLaunchpad: true,
				} );
				if ( destination ) {
					return [ destination, null, null ];
				}
			}

			return getOnboardingPostCheckoutDestination( {
				flowName,
				locale,
				siteSlug: providedDependencies.siteSlug as string,
			} );
		};

		/**
		 * With a plan already in the cart the plans step has nothing left to ask, so the flow
		 * goes straight to site creation. The free-plan and email-verification branches in the
		 * plans handler below only apply when no plan was picked, so nothing is skipped here.
		 */
		const navigateAfterDomain = () => {
			if ( ! skipsPlans ) {
				return navigate( 'plans' );
			}

			setSignupCompleteFlowName( flowName );

			return navigate( 'create-site', undefined, false );
		};

		const submit: SubmitHandler< typeof initialize > = async ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;
			switch ( slug ) {
				case 'domains':
					if ( ! providedDependencies ) {
						throw new Error( 'No provided dependencies found' );
					}

					if ( providedDependencies.navigateToUseMyDomain ) {
						const currentQueryArgs = getQueryArgs( window.location.href );

						const useMyDomainURL = addQueryArgs( 'use-my-domain', {
							...currentQueryArgs,
							initialQuery: providedDependencies.lastQuery,
						} );

						return navigate( useMyDomainURL as typeof currentStepSlug );
					}

					setSiteUrl( providedDependencies.siteUrl as string );
					setDomain( providedDependencies.suggestion as DomainSuggestion );
					setDomainCartItem( providedDependencies.domainItem as MinimalRequestCartProduct );
					setDomainCartItems( providedDependencies.domainCart as MinimalRequestCartProduct[] );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin as string );

					return navigateAfterDomain();
				case 'use-my-domain': {
					if (
						providedDependencies &&
						'mode' in providedDependencies &&
						providedDependencies.mode &&
						providedDependencies.domain
					) {
						const destination = addQueryArgs( 'use-my-domain', {
							...getQueryArgs( window.location.href ),
							step: providedDependencies.mode,
							initialQuery: providedDependencies.domain,
						} );
						return navigate( destination as typeof currentStepSlug );
					}

					if ( providedDependencies && 'domainCartItem' in providedDependencies ) {
						setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN );
						setHideFreePlan( true );
						setDomainCartItem( providedDependencies.domainCartItem );
					}

					return navigateAfterDomain();
				}
				case 'plans': {
					const cartItems = providedDependencies.cartItems;
					const [ pickedPlan, ...products ] = cartItems ?? [];

					setPlanCartItem( pickedPlan );

					if ( ! pickedPlan ) {
						// Since we're removing the paid domain, it means that the user chose to continue
						// with a free domain. Because signupDomainOrigin should reflect the last domain
						// selection status before they land on the checkout page, this value can be
						// 'free' or 'choose-later'
						if ( signupDomainOrigin === 'choose-later' ) {
							setSignupDomainOrigin( signupDomainOrigin );
						} else {
							setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.FREE );
						}
					}

					// Make sure to put the rest of products into the cart, e.g. the storage add-ons.
					setProductCartItems( products.filter( ( product ) => product !== null ) );

					setSignupCompleteFlowName( flowName );

					// A fully free order never reaches checkout, so the post-plan-selection gate is met here,
					// right after the plan is chosen, before the site is created.
					if ( postPlanSelectionEmailVerification && ! pickedPlan ) {
						return navigate(
							'email-verification?next=create-site' as typeof currentStepSlug,
							undefined,
							false
						);
					}

					return navigate( 'create-site', undefined, false );
				}
				case 'email-verification': {
					const next = queryParams.get( 'next' ) || 'create-site';
					return navigate( next as typeof currentStepSlug );
				}
				case 'create-site':
					return navigate( 'processing', undefined, true );
				case 'wow-funnel-handoff':
					// Success replaces location with the built site itself, so the only thing
					// that reaches navigation here is a failed or timed-out wait.
					return navigate( STEPS.ERROR.slug );
				case 'post-checkout-onboarding': {
					setShouldShowNotification( providedDependencies?.siteId as number );
					return navigate( 'processing' );
				}
				case 'setup-your-site-ai': {
					const setupChoice = providedDependencies?.setupChoice;
					const siteSlug = providedDependencies?.siteSlug as string;
					const siteId = providedDependencies?.siteId as number | string | undefined;
					const prompt = providedDependencies?.prompt as string | undefined;

					switch ( setupChoice ) {
						case 'build-with-ai':
							window.location.assign(
								addQueryArgs( `/setup/${ SITE_SETUP_FLOW }/${ STEPS.LAUNCH_BIG_SKY.slug }`, {
									siteSlug,
									// Skip siteId when it's 0/falsy: useSiteData returns 0 before
									// the site object hydrates, and "0" in the URL poisons the
									// next page's site lookup.
									...( siteId && siteId !== '0' ? { siteId } : {} ),
									fromPostCheckoutSetupSite: '1',
									...( refParameter ? { ref: refParameter } : {} ),
									...( prompt ? { prompt } : {} ),
								} )
							);
							return;
						case 'generate-theme': {
							// Provision an Atomic (WP Cloud) site up front so the custom
							// AI-generated theme can be installed, then hand off to the build-wow
							// site-spec step. The step offers this only behind the site builder
							// swap flag on an Atomic-capable plan; the build-wow endpoint still
							// enforces its own (currently Automattician-only) permission.
							const siteIdentifier = getBuildWowSiteIdentifier( {
								siteSlug,
								siteId,
							} );

							if ( ! siteIdentifier ) {
								logBuildWowEvent( 'start_missing_site', {
									site_slug: siteSlug,
									site_id: siteId,
								} );
								return navigate( 'error' as typeof currentStepSlug );
							}

							try {
								await requestBuildWowSite( siteIdentifier );
								logBuildWowEvent( 'start_success', {
									site_identifier: siteIdentifier,
								} );
							} catch ( error ) {
								logBuildWowEvent( 'start_error', {
									site_identifier: siteIdentifier,
									error: error instanceof Error ? error.message : String( error ),
								} );
								return navigate( 'error' as typeof currentStepSlug );
							}

							window.location.assign(
								getBuildWowSiteSpecUrl( {
									siteSlug,
									siteId,
									ref: refParameter,
								} )
							);
							return;
						}
						case 'blank-site': {
							if ( refParameter === WOO_HOSTING_SOLUTIONS_REF ) {
								const site = await resolveSelect( SITE_STORE ).getSite( siteSlug );
								const adminUrl = site?.options?.admin_url ?? `https://${ siteSlug }/wp-admin/`;
								window.location.assign( `${ adminUrl }admin.php?page=wc-admin` );
								return;
							}

							// Launchpad-personalization treatments land in wp-admin instead of My Home
							// (which would bounce them there anyway, one redirect later).
							const variation = await resolveLaunchpadPersonalizationVariation( diyLaunchpad );
							if ( variation !== 'control' ) {
								const site = await resolveSelect( SITE_STORE ).getSite( siteSlug );
								const adminUrl = site?.options?.admin_url ?? `https://${ siteSlug }/wp-admin/`;
								const destination = getLaunchpadPersonalizationDestination( {
									variation,
									adminUrl,
									enableAiLaunchpad: true,
								} );
								if ( destination ) {
									window.location.assign( destination );
									return;
								}
							}

							window.location.assign( `/home/${ siteSlug }` );
							return;
						}
						default:
							return;
					}
				}
				case 'processing': {
					if (
						providedDependencies.processingResult === ProcessingResult.NO_ACTION &&
						siteSlugParam
					) {
						// No pending action — the user landed on this page directly without
						// completing the prior step (e.g. a direct URL load or page refresh).
						// Redirect back to post-checkout-onboarding so it can set up the
						// pending action and advance the flow normally.
						window.location.replace(
							addQueryArgs( withLocale( '/setup/onboarding/post-checkout-onboarding', locale ), {
								siteSlug: siteSlugParam,
								...( refParameter ? { ref: refParameter } : {} ),
								...( diyLaunchpad ? { 'diy-launchpad': diyLaunchpad } : {} ),
							} )
						);
						return;
					}

					const launchpadPersonalizationVariation =
						await resolveLaunchpadPersonalizationVariation( diyLaunchpad );
					const [ destination, backDestination, backDestinationDomains ] =
						await getPostCheckoutDestination(
							providedDependencies,
							planCartItem,
							launchpadPersonalizationVariation
						);
					if ( providedDependencies.processingResult === ProcessingResult.SUCCESS ) {
						persistSignupDestination( destination );
						setSignupCompleteFlowName( flowName );
						setSignupCompleteSlug( providedDependencies.siteSlug );

						if ( providedDependencies.goToCheckout ) {
							const siteSlug = providedDependencies.siteSlug as string;

							/**
							 * If the user comes from the Playground onboarding flow,
							 * redirect the user back to Playground to start the import.
							 */
							const playgroundId = getQueryArg( window.location.href, 'playground' );
							let redirectTo: string =
								playgroundId &&
								! isPlanProductFree( {} as unknown as State, planCartItem?.product_id )
									? addQueryArgs( withLocale( '/setup/site-setup/importerPlayground', locale ), {
											siteSlug,
											siteId: providedDependencies.siteId,
											playground: playgroundId,
									  } )
									: addQueryArgs(
											withLocale( '/setup/onboarding/post-checkout-onboarding', locale ),
											{
												siteSlug,
												...( refParameter ? { ref: refParameter } : {} ),
												...( diyLaunchpad ? { 'diy-launchpad': diyLaunchpad } : {} ),
											}
									  );

							// Variant B: a paid order meets the post-plan-selection gate on return from checkout,
							// before post-checkout-onboarding. The Playground import path keeps its own
							// return target.
							if ( postPlanSelectionEmailVerification && ! playgroundId ) {
								redirectTo = addQueryArgs(
									withLocale( '/setup/onboarding/email-verification', locale ),
									{
										next: 'post-checkout-onboarding',
										siteSlug,
										...( refParameter ? { ref: refParameter } : {} ),
										...( diyLaunchpad ? { 'diy-launchpad': diyLaunchpad } : {} ),
									}
								);
							}

							const checkoutStepperPosition = getOnboardingStepperPosition(
								'checkout',
								skipsPlans
							);

							// replace the location to delete processing step from history.
							window.location.replace(
								addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }`, {
									// build_dest=wow and the WoW funnel (dest=editor) go
									// straight from checkout to their destination — no
									// post-checkout-onboarding hop, no chooser.
									redirect_to:
										blueprintArchiveSlug || isKnownWowFunnel( wowFunnelSlug )
											? destination
											: redirectTo,
									signup: 1,
									flow: ONBOARDING_FLOW,
									checkoutBackUrl: pathToUrl( backDestination ?? '' ),
									...( backDestinationDomains
										? { checkoutBackUrlDomains: pathToUrl( backDestinationDomains ) }
										: {} ),
									coupon,
									steps_current: checkoutStepperPosition.current,
									steps_total: checkoutStepperPosition.total,
									...( skipsPlans
										? { [ ONBOARDING_STEPPER_OMITTED_GROUP_PARAM ]: ONBOARDING_OMITTED_PLANS_GROUP }
										: {} ),
								} )
							);
						} else if ( blueprintArchiveSlug || isKnownWowFunnel( wowFunnelSlug ) ) {
							// build_dest=wow and the WoW funnel never show the
							// setup-your-site-ai chooser; go straight to their destination.
							window.location.replace( destination );
						} else if (
							refParameter === WOO_HOSTING_SOLUTIONS_REF &&
							isEnabled( 'onboarding/woo-hosting-post-purchase-setup-choice' )
						) {
							return navigate( 'setup-your-site-ai' );
						} else if ( providedDependencies?.postCheckoutBigSky ) {
							return navigate( 'setup-your-site-ai' );
						} else {
							// replace the location to delete processing step from history.
							window.location.replace( destination );
						}
					} else {
						return navigate( 'error' as typeof currentStepSlug );
					}
					return;
				}
				case 'playground':
				case 'blueprint': {
					const locationParams = new URLSearchParams( window.location.search );
					if ( locationParams.get( 'intent' ) === 'woocommerce' ) {
						const playgroundId = locationParams.get( 'playground' );
						return window.location.assign(
							addQueryArgs( '/setup/entrepreneur', {
								from: 'playground-publish',
								...( playgroundId ? { playground: playgroundId } : {} ),
							} )
						);
					}
					const backTo = window.location.pathname + window.location.search;
					return navigate(
						addQueryArgs( 'domains', { back_to: backTo } ) as typeof currentStepSlug
					);
				}
				default:
					return;
			}
		};

		const goBack = () => {
			switch ( currentStepSlug ) {
				case 'plans':
					return navigate( 'domains' );
				default:
					return window.history.back();
			}
		};

		return { submit, goBack };
	},
	useSideEffect( currentStepSlug ) {
		const reduxDispatch = useReduxDispatch();
		const { resetOnboardStore, setPlanCartItem, setProductCartItems } = useDispatch(
			ONBOARD_STORE
		) as OnboardActions;
		const isLoggedIn = useSelector( isUserLoggedIn );
		const user = useSelector( getCurrentUser );

		/**
		 * Clears every state we're persisting during the flow
		 * when entering it. This is to ensure that the user
		 * starts on a clean slate.
		 */
		useEffect( () => {
			// The route match is the unconstrained `/:flow/:step?/:lang?`, so
			// `/setup/onboarding/es` arrives with the locale in place of a step. Reading it as
			// a step would skip the reset.
			if ( ! currentStepSlug || getLanguageSlugs().includes( currentStepSlug ) ) {
				resetOnboardStore();
				reduxDispatch( setSelectedSiteId( null ) );
				clearStepPersistedState( this.name );
				clearSessionStorageQuery();
				clearSignupDestinationCookie();
				clearSignupCompleteFlowName();
				clearSignupCompleteSlug();
				clearSignupCompleteSiteID();

				// Must follow the reset above, not precede it.
				const query = getCurrentQueryParams();
				const preselectedPlan = getPreselectedPlan( query );
				const storageAddOn = getPreselectedStorageAddOn( query );

				if ( preselectedPlan ) {
					setPlanCartItem( { product_slug: preselectedPlan } );
				}

				if ( storageAddOn ) {
					setProductCartItems( [ storageAddOn ] );
				}
			}
		}, [
			currentStepSlug,
			reduxDispatch,
			resetOnboardStore,
			setPlanCartItem,
			setProductCartItems,
		] );

		/**
		 * Load Survicate and set visitor traits on each step navigation.
		 *
		 * This runs on every step change to ensure:
		 * - Survicate script loads successfully (retries if initial load failed)
		 * - Visitor traits are updated when user authentication state changes
		 * - Analytics tracking works correctly throughout the onboarding flow
		 */
		useEffect( () => {
			if ( isLoggedIn && user?.email && user?.date ) {
				addSurvicate( { email: user.email, registrationDate: user.date, userId: user.ID } );
			}
		}, [ isLoggedIn, currentStepSlug, user?.email, user?.date, user?.ID ] );

		// Skip the preload when this visit skips the plans step: enrolling someone in a
		// plans-page test they never see only dilutes it.
		useEffect( () => {
			if ( getPreselectedPlan( getCurrentQueryParams() ) ) {
				return;
			}

			loadExperimentAssignment( 'calypso_plans_page_visual_separation_2025_09_v2' );
		}, [] );

		// WoW funnel: create the Simple site as soon as the customer is in the flow, so its
		// Atomic host builds (and any follow-up work) while they pick a domain and check out.
		// Single-flight — the create-site step consumes the same site rather than creating a
		// second one. Only fires once the funnel step is known (currentStepSlug set) and the
		// user is logged in.
		//
		// The funnel is an internal-only experiment, but the gate lives server-side: /sites/new
		// only honours the option for Automatticians and the plan-gate skip is bound to the
		// option it writes. For anyone else this creates the site the flow would create anyway,
		// with the funnel option ignored.
		useEffect( () => {
			if ( ! currentStepSlug || ! isLoggedIn ) {
				return;
			}
			const queryParams = new URLSearchParams( window.location.search );
			const funnelSlug = getWowFunnelSlug( queryParams );
			const funnelArgs = getWowFunnelArgs( queryParams );
			const fromWfm = getWowFunnelFromWfm( queryParams );
			if ( ! funnelSlug ) {
				return;
			}

			void ( async () => {
				const remembered = getRememberedWowFunnelSite( funnelSlug, funnelArgs );
				if ( remembered ) {
					// A funnel run sells a plan for the site it builds, so a site that already has
					// one must never be resumed: checkout would offer a second plan for a site
					// that does not need one. Resume only while it is still unpaid.
					const site = await resolveSelect( SITE_STORE )
						.getSite( remembered.siteSlug )
						.catch( () => null );

					if ( ! wowFunnelSiteIsPaid( site ) ) {
						return;
					}

					logWowFunnelEvent( 'remembered_site_already_paid', {
						funnel: funnelSlug,
						blog_id: remembered.blogId,
					} );
					forgetWowFunnelRun( funnelSlug, funnelArgs );
				}

				await startWowFunnelSite( { funnelSlug, funnelArgs, fromWfm } ).catch( () => {
					// Errors are logged in the util; the create-site step retries as a fallback.
				} );
			} )();
		}, [ currentStepSlug, isLoggedIn ] );
	},
};

export default onboarding;
