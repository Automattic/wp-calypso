/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import wp from '../../../lib/wp';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { USER_STORE } from '../stores/user';
import { SITE_STORE } from '../stores/site';
import { recordOnboardingComplete } from '../lib/analytics';
import { useSelectedPlan, useShouldRedirectToEditorAfterCheckout } from './use-selected-plan';
import { clearLastNonEditorRoute } from '../lib/clear-last-non-editor-route';
import { useIsAnchorFm, useAnchorFmPodcastId, useAnchorFmEpisodeId } from '../path';

const wpcom = wp.undocumented();

interface Cart {
	blog_id: number;
	cart_key: number;
	coupon: string;
	coupon_discounts: unknown[];
	coupon_discounts_integer: unknown[];
	is_coupon_applied: boolean;
	has_bundle_credit: boolean;
	next_domain_is_free: boolean;
	next_domain_condition: string;
	products: unknown[];
	total_cost: number;
	currency: string;
	total_cost_display: string;
	total_cost_integer: number;
	temporary: boolean;
	tax: unknown;
	sub_total: number;
	sub_total_display: string;
	sub_total_integer: number;
	total_tax: number;
	total_tax_display: string;
	total_tax_integer: number;
	credits: number;
	credits_display: string;
	credits_integer: number;
	allowed_payment_methods: unknown[];
	create_new_blog: boolean;
	messages: Record< 'errors' | 'success', unknown >;
}

/**
 * After a new site has been created there are 3 scenarios to cover:
 * 1. The user explicitly selected a paid plan using PlansGrid => redirect to checkout with that plan + any selected paid domain in cart
 * 2. The user selected a paid domain using DomainPicker (Premium Plan appears in top-right corner) => show PlansGrid as the last step of Gutenboarding => scenario 1
 * 3. The user is still seeing 'Free Plan' label on PlansButton => redirect to editor
 **/

export default function useOnSiteCreation(): void {
	const { domain } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );
	const isRedirecting = useSelect( ( select ) => select( ONBOARD_STORE ).getIsRedirecting() );
	const newSite = useSelect( ( select ) => select( SITE_STORE ).getNewSite() );
	const newUser = useSelect( ( select ) => select( USER_STORE ).getNewUser() );
	const selectedPlan = useSelectedPlan();
	const shouldRedirectToEditorAfterCheckout = useShouldRedirectToEditorAfterCheckout();
	const design = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );

	const isAnchorFmSignup = useIsAnchorFm();
	const anchorFmPodcastId = useAnchorFmPodcastId();
	const anchorFmEpisodeId = useAnchorFmEpisodeId();

	const { resetOnboardStore, setIsRedirecting, setSelectedSite } = useDispatch( ONBOARD_STORE );
	const flowCompleteTrackingParams = {
		isNewSite: !! newSite,
		isNewUser: !! newUser,
		blogId: newSite?.blogid,
		hasCartItems: false,
	};

	React.useEffect( () => {
		// isRedirecting check this is needed to make sure we don't overwrite the first window.location.replace() call
		if ( newSite && ! isRedirecting ) {
			setIsRedirecting( true );

			if ( selectedPlan && ! selectedPlan?.isFree ) {
				const planProduct = {
					product_id: selectedPlan.productId,
					product_slug: selectedPlan.storeSlug,
					extra: {
						source: 'gutenboarding',
					},
				};
				const domainProduct = {
					meta: domain?.domain_name,
					product_id: domain?.product_id,
					extra: {
						privacy_available: domain?.supports_privacy,
						privacy: domain?.supports_privacy,
						source: 'gutenboarding',
					},
				};
				const go = async () => {
					const cart: Cart = await wpcom.getCart( newSite.site_slug );
					await wpcom.setCart( newSite.blogid, {
						...cart,
						products: [ ...cart.products, planProduct, domainProduct ],
					} );
					resetOnboardStore();
					clearLastNonEditorRoute();
					setSelectedSite( newSite.blogid );

					const editorUrl = design?.is_fse
						? `site-editor%2F${ newSite.site_slug }`
						: `block-editor%2Fpage%2F${ newSite.site_slug }%2Fhome`;

					const redirectionUrl = shouldRedirectToEditorAfterCheckout
						? `/checkout/${ newSite.site_slug }?preLaunch=1&isGutenboardingCreate=1&redirect_to=%2F${ editorUrl }`
						: `/checkout/${ newSite.site_slug }?preLaunch=1&isGutenboardingCreate=1`;
					window.location.href = redirectionUrl;
				};
				recordOnboardingComplete( {
					...flowCompleteTrackingParams,
					hasCartItems: true,
				} );
				go();
				return;
			}

			recordOnboardingComplete( flowCompleteTrackingParams );
			resetOnboardStore();
			clearLastNonEditorRoute();
			setSelectedSite( newSite.blogid );

			let destination;
			if ( design?.is_fse ) {
				destination = `/site-editor/${ newSite.site_slug }/`;
			} else if ( isAnchorFmSignup ) {
				// Working URL for creating a new post w/ anchor in wp-admin:
				// http://localhost:8888/wp-admin/post-new.php?action=edit&anchor_podcast=22b6608&anchor_episode=e324a06c-3148-43a4-85d8-34c0d8222138&spotify_show_url=https%3A%2F%2Fopen.spotify.com%2Fshow%2F6HTZdaDHjqXKDE4acYffoD%3Fsi%3DEVfDYETjQCu7pasVG5D73Q
				// In Jetpack, anchor-fm.php looks for these
				// However, we're on calypso.. that means we might need to make sure another step passes along the info correctly
				// what does /post/{site} do in calypso?
				// can we make query strings get passed from the parent to iframe?
				destination = `/post/${ newSite.site_slug }?anchor_podcast=${ anchorFmPodcastId }&anchor_episode=${ anchorFmEpisodeId }`;
			} else {
				destination = `/page/${ newSite.site_slug }/home`;
			}
			window.location.href = destination;
		}
	}, [
		domain,
		selectedPlan,
		isRedirecting,
		newSite,
		newUser,
		resetOnboardStore,
		setIsRedirecting,
		setSelectedSite,
		flowCompleteTrackingParams,
		shouldRedirectToEditorAfterCheckout,
		design,
		isAnchorFmSignup,
	] );
}
