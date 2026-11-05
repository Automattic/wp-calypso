import { DotcomFeatures } from '@automattic/api-core';
import { OnboardActions, OnboardSelect } from '@automattic/data-stores';
import { updateLaunchpadSettings, useLaunchpad } from '@automattic/launchpad';
import { addProductsToCart, DOMAIN_AND_PLAN_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { addQueryArgs, getQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { createElement, useRef } from 'react';
import { dashboardOrigins } from 'calypso/dashboard/utils/link';
import { hasPlanFeature } from 'calypso/dashboard/utils/site-features';
import wpcom from 'calypso/lib/wp';
import { domainMappingSetup } from 'calypso/my-sites/domains/paths';
import { SIGNUP_DOMAIN_ORIGIN } from '../../../../../lib/analytics/signup';
import { useQuery } from '../../../hooks/use-query';
import { useSite } from '../../../hooks/use-site';
import { useSiteSlug } from '../../../hooks/use-site-slug';
import { ONBOARD_STORE } from '../../../stores';
import { getCurrentQueryParams } from '../../../utils/get-current-query-params';
import { getSingleMappingDomain } from '../../../utils/get-single-mapping-domain';
import { STEPS } from '../../internals/steps';
import type { FlowV2, SubmitHandler } from '../../internals/types';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

function initialize() {
	const query = getCurrentQueryParams();

	if ( ! query.get( 'siteSlug' ) && ! query.get( 'siteId' ) ) {
		window.location.replace( '/sites' );
		return false;
	}

	return [ STEPS.DOMAIN_SEARCH, STEPS.USE_MY_DOMAIN, STEPS.UNIFIED_PLANS ];
}

/**
 * The `domainConnectionSetupUrl` template arrives via the query string and ends up in
 * `window.location.replace()`, so resolve it the way the browser will and accept only
 * this origin and the dashboard's. Substring checks are bypassable
 * (`https://my.wordpress.com.evil.example`, `/\evil.example`), hence parsed origins.
 */
function isSafeDomainConnectionSetupUrl( value: string ) {
	try {
		const resolvedOrigin = new URL( value, window.location.origin ).origin;

		return (
			resolvedOrigin === window.location.origin || dashboardOrigins().includes( resolvedOrigin )
		);
	} catch {
		return false;
	}
}

const domainUpsell: FlowV2< typeof initialize > = {
	name: DOMAIN_AND_PLAN_FLOW,
	isSignupFlow: false,
	initialize,

	useStepsProps() {
		const translate = useTranslate();
		const { domainCartItem, signupDomainOrigin } = useSelect( ( select ) => {
			const onboard = select( ONBOARD_STORE ) as OnboardSelect;

			return {
				domainCartItem: onboard.getDomainCartItem(),
				signupDomainOrigin: onboard.getSignupDomainOrigin(),
			};
		}, [] );
		// Only a registration comes free with the plan; a domain the user already owns is
		// connected or transferred instead.
		const registeredDomainName =
			signupDomainOrigin === SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN
				? undefined
				: domainCartItem?.meta;

		return {
			[ STEPS.UNIFIED_PLANS.slug ]: {
				// The site already exists, so price the plans as an upgrade.
				isInSignup: false,
				isStepperUpgradeFlow: true,
				hideFreePlan: true,
				hidePlanTypeSelector: true,
				headerText: registeredDomainName
					? __( 'Your domain name is ready' )
					: __( 'Choose the perfect plan' ),
				subHeaderText: registeredDomainName
					? translate(
							'Get {{strong}}%(domainName)s{{/strong}} free for the first year with any annual plan.',
							{
								args: { domainName: registeredDomainName },
								components: { strong: createElement( 'strong' ) },
							}
						)
					: undefined,
			},
		};
	},

	useStepNavigation( currentStep, navigate ) {
		const backTo = useQuery().get( 'back_to' );
		const siteSlug = useSiteSlug()!;
		const site = useSite();
		const hasQualifyingPlan =
			!! site?.plan && ! site.plan.is_free && site.plan.billing_period !== 'Monthly';
		// Connecting a domain is bundled with every paid plan, so there is nothing left to buy.
		const mappingIsIncludedInPlan =
			( !! site?.plan && ! site.plan.is_free ) ||
			( !! site && hasPlanFeature( site, DotcomFeatures.DOMAIN_MAPPING ) );

		const domainConnectionSetupUrlParam = useQuery().get( 'domainConnectionSetupUrl' );
		const domainConnectionSetupUrl =
			domainConnectionSetupUrlParam &&
			isSafeDomainConnectionSetupUrl( domainConnectionSetupUrlParam )
				? domainConnectionSetupUrlParam
				: null;
		const { getDomainCartItems } = useSelect(
			( select ) => ( {
				getDomainCartItems: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItems,
			} ),
			[]
		);
		const { setDomainCartItem, setDomainCartItems, setSignupDomainOrigin } = useDispatch(
			ONBOARD_STORE
		) as OnboardActions;
		const { data: { launchpad_screen: launchpadScreenOption } = {} } = useLaunchpad( siteSlug );

		const returnUrl =
			launchpadScreenOption === 'skipped' || ! backTo ? `/home/${ siteSlug }` : backTo;

		const submittedDomains = useRef( false );

		function getDomainConnectionSetupUrl( domain: string ) {
			return domainConnectionSetupUrl
				? domainConnectionSetupUrl.replace( '%s', domain )
				: domainMappingSetup( siteSlug, domain, '', false, true );
		}

		function getPostCheckoutUrl( domainCartItems: MinimalRequestCartProduct[] ) {
			// A connected domain still has to be pointed at the site once it is paid for, so
			// finish on the setup instructions rather than wherever the user came from.
			const domain = getSingleMappingDomain( domainCartItems );

			return domain ? getDomainConnectionSetupUrl( domain ) : returnUrl;
		}

		async function addToCartAndRedirectToCheckout(
			planCartItems: MinimalRequestCartProduct[] = []
		) {
			const domainCartItems = getDomainCartItems() ?? [];
			const cartItems = [ ...planCartItems, ...domainCartItems ];

			if ( cartItems.length === 0 ) {
				return window.location.assign( returnUrl );
			}

			await addProductsToCart( siteSlug, DOMAIN_AND_PLAN_FLOW, cartItems );

			return window.location.assign(
				`/checkout/${ siteSlug }?redirect_to=${ encodeURIComponent(
					getPostCheckoutUrl( domainCartItems )
				) }`
			);
		}

		function goBack() {
			if ( currentStep === STEPS.DOMAIN_SEARCH.slug ) {
				return window.location.assign( returnUrl );
			}
			if ( currentStep === STEPS.UNIFIED_PLANS.slug ) {
				if ( ! submittedDomains.current ) {
					return window.location.assign( returnUrl );
				}

				return navigate( STEPS.DOMAIN_SEARCH.slug );
			}

			if ( currentStep === STEPS.USE_MY_DOMAIN.slug ) {
				return navigate( STEPS.DOMAIN_SEARCH.slug );
			}

			throw new Error( `Step back button not handled: ${ currentStep }` );
		}

		const submit: SubmitHandler< typeof initialize > = async ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case STEPS.DOMAIN_SEARCH.slug: {
					if ( providedDependencies?.navigateToUseMyDomain ) {
						const currentQueryArgs = getQueryArgs( window.location.href );
						currentQueryArgs.step = 'domain-input';

						let useMyDomainURL = addQueryArgs( STEPS.USE_MY_DOMAIN.slug, currentQueryArgs );

						const lastQueryParam = providedDependencies.lastQuery;

						if ( lastQueryParam !== undefined ) {
							currentQueryArgs.initialQuery = lastQueryParam;
							useMyDomainURL = addQueryArgs( useMyDomainURL, currentQueryArgs );
						}

						return navigate( useMyDomainURL as typeof currentStep );
					}

					submittedDomains.current = true;

					setDomainCartItem( providedDependencies?.domainItem );
					setDomainCartItems( providedDependencies?.domainCart ?? [] );
					setSignupDomainOrigin( providedDependencies?.signupDomainOrigin );

					if ( hasQualifyingPlan ) {
						return addToCartAndRedirectToCheckout();
					}

					return navigate( STEPS.UNIFIED_PLANS.slug );
				}
				case STEPS.USE_MY_DOMAIN.slug: {
					setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN );

					if ( providedDependencies && 'mode' in providedDependencies ) {
						const destination = addQueryArgs( STEPS.USE_MY_DOMAIN.slug, {
							...getQueryArgs( window.location.href ),
							step: providedDependencies.mode,
							initialQuery: providedDependencies.domain,
						} );
						return navigate( destination as typeof currentStep );
					}

					// The step verified domain ownership and created the mapping itself, so all
					// that is left is to walk the user through pointing the domain at the site.
					if ( providedDependencies && 'ownershipVerificationCompleted' in providedDependencies ) {
						submittedDomains.current = true;

						// replace() rather than assign(): Back must not land on a submit step
						// for a mapping that already exists.
						return window.location.replace(
							getDomainConnectionSetupUrl( providedDependencies.domain )
						);
					}

					submittedDomains.current = true;

					// The domain can only be connected once the user has bought a plan.
					if ( providedDependencies && 'skipToPlan' in providedDependencies ) {
						return navigate( STEPS.UNIFIED_PLANS.slug );
					}

					const domainCartItem =
						providedDependencies && 'domainCartItem' in providedDependencies
							? providedDependencies.domainCartItem
							: undefined;

					if ( ! domainCartItem ) {
						return navigate( STEPS.UNIFIED_PLANS.slug );
					}

					setDomainCartItem( domainCartItem );
					setDomainCartItems( [ domainCartItem ] );

					const domain = getSingleMappingDomain( [ domainCartItem ] );

					// Nothing to charge for: connect the domain right away and send the user to the
					// setup instructions rather than through an empty checkout.
					if ( site && domain && mappingIsIncludedInPlan ) {
						try {
							await wpcom.req.post( `/sites/${ site.ID }/add-domain-mapping`, { domain } );

							// replace() rather than assign(): Back must not land on a submit step
							// for a mapping that already exists.
							return window.location.replace( getDomainConnectionSetupUrl( domain ) );
						} catch {
							// The plan already covers the connection, so let checkout retry it. Falling
							// through to the plans step would ask a paying customer to buy a plan twice.
							return addToCartAndRedirectToCheckout();
						}
					}

					if ( hasQualifyingPlan ) {
						return addToCartAndRedirectToCheckout();
					}

					return navigate( STEPS.UNIFIED_PLANS.slug );
				}
				case STEPS.UNIFIED_PLANS.slug: {
					await updateLaunchpadSettings( siteSlug, {
						checklist_statuses: { plan_completed: true },
					} );

					// The plan comes first, followed by any add-ons picked alongside it. `null` means
					// the user kept the free plan, which leaves just the domain to buy.
					return addToCartAndRedirectToCheckout( providedDependencies?.cartItems ?? [] );
				}
			}
		};

		return { submit, goBack };
	},
};

export default domainUpsell;
