import { PLAN_WPCOM_FLEXIBLE } from '@automattic/calypso-products';
import { Visibility } from '@automattic/data-stores';
import { FLEX_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import wpcomRequest from 'wpcom-proxy-request';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { setSignupCompleteFlowName, persistSignupDestination } from 'calypso/signup/storageUtils';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { useSiteData } from '../../../hooks/use-site-data';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import type { FlowV2, SubmitHandler } from '../../internals/types';
import type { Store } from 'redux';

async function initialize( reduxStore: Store ) {
	const steps = [ STEPS.POST_CHECKOUT_ONBOARDING, STEPS.FLEX_SITE_CREATION, STEPS.PROCESSING ];
	// Clear any selected site to ensure we start fresh
	reduxStore.dispatch( setSelectedSiteId( null ) as any );

	// Check if user is logged in
	const state = reduxStore.getState();
	const userIsLoggedIn = state?.currentUser?.id != null;

	// Check if we have a site in the URL params or are returning from checkout
	const urlParams = new URLSearchParams( window.location.search );
	const hasSiteParam = urlParams.has( 'siteSlug' ) || urlParams.has( 'siteId' );
	const currentPath = window.location.pathname;
	const isReturningFromCheckout = currentPath.includes( '/post-checkout-onboarding' );

	// If no site exists and we're not returning from checkout, redirect to checkout
	if ( ! hasSiteParam && ! isReturningFromCheckout ) {
		// Set completion tracking for post-checkout site creation
		setSignupCompleteFlowName( FLEX_SITE_FLOW );

		// Set the post-checkout destination to return to this flow
		persistSignupDestination( `/setup/${ FLEX_SITE_FLOW }/post-checkout-onboarding` );

		// Create siteParams for post-checkout site creation (similar to onboarding-unified)
		const siteParams = {
			blog_name: '', // Will be auto-generated from username if empty
			blog_title: translate( 'My Flex Site' ), // Default site title
			public: Visibility.PublicNotIndexed, // Coming soon by default
			options: {
				site_creation_flow: FLEX_SITE_FLOW, // Track which flow created the site
				wpcom_public_coming_soon: 1, // Launch as coming soon
			},
			find_available_url: true, // Auto-find available URL
			validate: false,
		};

		// Save siteParams to localStorage for checkout to use
		try {
			window.localStorage.setItem( 'siteParams', JSON.stringify( siteParams ) );
		} catch ( error ) {
			// Silently fail if localStorage is not available
		}

		// Build checkout URL - use unified checkout for both logged-in and logged-out users
		const checkoutParams: Record< string, string | number > = {
			flow: FLEX_SITE_FLOW,
		};

		// Only add signup=1 for logged-out users to avoid account creation conflicts
		if ( ! userIsLoggedIn ) {
			checkoutParams.signup = 1;
		}

		const checkoutUrl = addQueryArgs(
			`/checkout/unified/${ PLAN_WPCOM_FLEXIBLE }`,
			checkoutParams
		);

		// Redirect to checkout
		window.location.assign( checkoutUrl );

		// Return false since we're redirecting (no steps to render)
		return false;
	}

	// If we have a site, proceed with the normal flow
	// Start with post-checkout-onboarding for any post-purchase setup,
	// flex-site-creation for title customization, and processing for final setup
	return stepsWithRequiredLogin( steps );
}

const flexSite: FlowV2< typeof initialize > = {
	name: FLEX_SITE_FLOW,
	get title() {
		return translate( 'Create a Flex site' );
	},
	__experimentalUseSessions: true,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: true,
	initialize,
	useStepNavigation( currentStep, navigate ) {
		const { setSiteTitle, setPendingAction } = useDispatch( ONBOARD_STORE );
		const { saveSiteSettings } = useDispatch( SITE_STORE );
		const { site, siteSlug } = useSiteData();

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep as any;

			switch ( slug ) {
				case 'post-checkout-onboarding':
					// Site created after checkout, now navigate to flex-site-creation
					// to allow user to set/update the site title
					return navigate( STEPS.FLEX_SITE_CREATION.slug );

				case 'flex-site-creation':
					// Store site title and set up pending action to update it
					if ( providedDependencies?.siteName ) {
						setSiteTitle( providedDependencies.siteName );

						if ( site?.ID ) {
							const currentSiteId = site.ID;
							const currentSiteSlug = siteSlug || site.slug;
							const selectedSiteName = providedDependencies.siteName;
							const isFlexSite = Boolean(
								( site as { is_wpcom_flex?: boolean } | null )?.is_wpcom_flex
							);

							// Set pending action to update site title on both the shadow site and the Atomic site.
							setPendingAction( async () => {
								const requests: Array< Promise< unknown > > = [
									saveSiteSettings( currentSiteId, { blogname: selectedSiteName } ),
								];

								if ( isFlexSite ) {
									const formData: Array< [ string, string ] > = [
										[ 'settings', JSON.stringify( { blogname: selectedSiteName } ) ],
									];

									requests.push(
										wpcomRequest( {
											path: `/sites/${ currentSiteId }/onboarding-customization`,
											apiNamespace: 'wpcom/v2',
											method: 'POST',
											formData,
										} )
									);
								}

								await Promise.all( requests );

								return {
									siteSlug: currentSiteSlug,
								};
							} );
						}
					}
					// Navigate to processing step to update site title
					return navigate( STEPS.PROCESSING.slug, undefined, true );

				case 'processing': {
					if (
						providedDependencies?.processingResult === ProcessingResult.SUCCESS &&
						typeof providedDependencies.siteSlug === 'string'
					) {
						// Redirect to the Flex site's wp-admin with logmein parameter for direct login
						return window.location.replace(
							`https://${ providedDependencies.siteSlug }/wp-admin/?logmein=direct`
						);
					}
					// Use siteSlug from hook if available
					if ( siteSlug ) {
						return window.location.replace( `https://${ siteSlug }/wp-admin/?logmein=direct` );
					}
					// Fallback to sites dashboard
					return window.location.replace( '/sites' );
				}
			}
		};

		return { submit };
	},
};

export default flexSite;
