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
import { STORE_KEY as PLANS_STORE } from '../stores/plans';
import { USER_STORE } from '../stores/user';
import { SITE_STORE } from '../stores/site';
import { recordOnboardingComplete } from '../lib/analytics';

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

export default function useOnSiteCreation() {
	const { domain } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );
	const hasPaidDomain = useSelect( ( select ) => select( ONBOARD_STORE ).hasPaidDomain() );
	const isRedirecting = useSelect( ( select ) => select( ONBOARD_STORE ).getIsRedirecting() );
	const selectedPlan = useSelect( ( select ) => select( PLANS_STORE ) ).getSelectedPlan();
	const newSite = useSelect( ( select ) => select( SITE_STORE ).getNewSite() );
	const newUser = useSelect( ( select ) => select( USER_STORE ).getNewUser() );

	const { resetOnboardStore, setIsRedirecting } = useDispatch( ONBOARD_STORE );
	const { resetPlan } = useDispatch( PLANS_STORE );

	React.useEffect( () => {
		// isRedirecting check this is needed to make sure we don't overwrite the first window.location.replace() call
		if ( newSite && ! isRedirecting ) {
			setIsRedirecting( true );

			if ( selectedPlan ) {
				const planProduct = {
					meta: selectedPlan.getTitle(),
					product_id: selectedPlan.getProductId(),
					product_slug: selectedPlan.getStoreSlug(),
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
					resetPlan();
					resetOnboardStore();
					window.location.replace(
						`/checkout/${ newSite.site_slug }?preLaunch=1&isGutenboardingCreate=1&redirect_to=%2Fblock-editor%2Fpage%2F${ newSite.site_slug }%2Fhome`
					);
				};
				go();
				return;
			}

			if ( hasPaidDomain ) {
				// I'd rather not make my own product, but this works.
				// lib/cart-items helpers did not perform well.
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
						products: [ ...cart.products, domainProduct ],
					} );
					resetOnboardStore();
					window.location.replace( `/start/prelaunch?siteSlug=${ newSite.blogid }` );
				};
				go();
				return;
			}

			recordOnboardingComplete( {
				isNewSite: !! newSite,
				isNewUser: !! newUser,
				blogId: newSite.blogid,
			} );
			resetOnboardStore();

			window.location.replace( `/block-editor/page/${ newSite.site_slug }/home` );
		}
	}, [
		domain,
		hasPaidDomain,
		selectedPlan,
		isRedirecting,
		newSite,
		newUser,
		resetOnboardStore,
		resetPlan,
		setIsRedirecting,
	] );
}
