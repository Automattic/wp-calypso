import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	applyTestFiltersToPlansList,
	PRODUCT_1GB_SPACE,
	type PlanSlug,
	isWpcomEnterpriseGridPlan,
	isFreePlan,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { AddOns, Plans } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import { useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { getPlanCartItem } from 'calypso/lib/cart-values/cart-items';
import { addQueryArgs } from 'calypso/lib/url';
import { cancelPurchase } from 'calypso/me/purchases/paths';
import { useFreeTrialPlanSlugs } from 'calypso/my-sites/plans-features-main/hooks/use-free-trial-plan-slugs';
import { useSelector } from 'calypso/state';
import { isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors';
import { getSiteSlug, getSiteUrl, isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import { IAppState } from 'calypso/state/types';
import useCurrentPlanManageHref from './use-current-plan-manage-href';
import type { PlansIntent, UseActionCallback } from '@automattic/plans-grid-next';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

/**
 * Purchase attribution that arrived on the plans page URL (`source`,
 * `ai_session_id`). Checkout reads both from its own URL, so the plans page
 * forwards them to the checkout it opens.
 */
export interface CheckoutAttribution {
	source?: string;
	aiSessionId?: string;
}

function useUpgradeHandler( {
	siteSlug,
	coupon,
	cartHandler,
	redirectTo,
	pluginSlug,
	checkoutAttribution,
}: {
	siteSlug?: string | null;
	coupon?: string;
	cartHandler?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void;
	redirectTo?: string;
	pluginSlug?: string;
	checkoutAttribution?: CheckoutAttribution;
} ) {
	const { source, aiSessionId } = checkoutAttribution ?? {};

	const processCartItems = useCallback(
		( cartItems?: MinimalRequestCartProduct[] | null ) => {
			const cartItemForPlan = getPlanCartItem( cartItems );

			const cartItemForStorageAddOn = cartItems?.find(
				( items ) => items.product_slug === PRODUCT_1GB_SPACE
			);

			if ( cartItemForStorageAddOn?.extra ) {
				recordTracksEvent( 'calypso_signup_storage_add_on_upgrade_click', {
					add_on_slug: cartItemForStorageAddOn.extra.feature_slug,
				} );
			}

			if ( cartHandler ) {
				cartHandler( cartItems );
				return;
			}

			const planPath = cartItemForPlan?.product_slug ?? '';

			let checkoutUrl = cartItemForStorageAddOn
				? `/checkout/${ siteSlug }/${ planPath },${ cartItemForStorageAddOn.product_slug }:-q-${ cartItemForStorageAddOn.quantity }`
				: `/checkout/${ siteSlug }/${ planPath }`;

			// Append plugin if present
			if ( pluginSlug ) {
				checkoutUrl = cartItemForStorageAddOn
					? `${ checkoutUrl },${ pluginSlug }`
					: `/checkout/${ siteSlug }/${ planPath },${ pluginSlug }`;
			}

			const checkoutUrlWithArgs = addQueryArgs(
				{
					...( coupon && { coupon } ),
					...( redirectTo && { redirect_to: redirectTo } ),
					...( source && { source } ),
					...( aiSessionId && { ai_session_id: aiSessionId } ),
				},
				checkoutUrl
			);

			page( checkoutUrlWithArgs );
			return;
		},
		[ siteSlug, coupon, cartHandler, redirectTo, pluginSlug, source, aiSessionId ]
	);

	return useCallback(
		( {
			cartItemForPlan,
			selectedStorageAddOn,
		}: {
			cartItemForPlan?: MinimalRequestCartProduct | null;
			selectedStorageAddOn?: AddOns.AddOnMeta | null;
		} ) => {
			/* 1. Process plan and add-ons for checkout. */
			const storageAddOnCartItem = selectedStorageAddOn &&
				! selectedStorageAddOn.purchased && {
					product_slug: selectedStorageAddOn.productSlug,
					quantity: selectedStorageAddOn.quantity,
					volume: 1,
					// TODO: `feature_slug` below should be refactored to `add_on_slug` now that the two concepts are separated
					extra: { feature_slug: selectedStorageAddOn?.addOnSlug },
				};

			if ( cartItemForPlan ) {
				processCartItems?.( [
					cartItemForPlan,
					...( storageAddOnCartItem ? [ storageAddOnCartItem ] : [] ),
				] );
				return;
			}

			/* 2. Process free plan for checkout */
			processCartItems?.( null );
			return;
		},
		[ processCartItems ]
	);
}

function useDowngradeHandler( {
	siteSlug,
	siteUrl,
	currentPlan,
}: {
	siteSlug?: string | null;
	siteUrl?: string | null;
	currentPlan: Plans.SitePlan | undefined;
} ) {
	const { setNewMessagingChat, setNavigateToOdie } = useDispatch( HELP_CENTER_STORE );
	const { data: canConnectToZendeskMessaging } = useCanConnectToZendeskMessaging();

	return useCallback(
		( planSlug: PlanSlug ) => {
			// A downgrade to the free plan is essentially cancelling the current plan.
			if ( isFreePlan( planSlug ) ) {
				page( cancelPurchase( siteSlug, currentPlan?.purchaseId ) );
				return;
			}

			if ( canConnectToZendeskMessaging ) {
				setNewMessagingChat( {
					initialMessage: 'User wants to downgrade plan.',
					siteUrl,
				} );
			} else {
				setNavigateToOdie();
			}
		},
		[
			currentPlan?.purchaseId,
			setNewMessagingChat,
			siteUrl,
			siteSlug,
			canConnectToZendeskMessaging,
			setNavigateToOdie,
		]
	);
}

function useGenerateActionCallback( {
	currentPlan,
	eligibleForFreeHostingTrial,
	cartHandler,
	flowName,
	intent,
	showModalAndExit,
	sitePlanSlug,
	siteId,
	coupon,
	redirectTo,
	pluginSlug,
	checkoutAttribution,
}: {
	currentPlan: Plans.SitePlan | undefined;
	eligibleForFreeHostingTrial: boolean;
	cartHandler?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void;
	flowName?: string | null;
	intent?: PlansIntent | null;
	showModalAndExit?: ( planSlug: PlanSlug ) => boolean | Promise< boolean >;
	sitePlanSlug?: PlanSlug | null;
	siteId?: number | null;
	coupon?: string;
	redirectTo?: string;
	pluginSlug?: string;
	checkoutAttribution?: CheckoutAttribution;
} ): UseActionCallback {
	const siteSlug = useSelector( ( state: IAppState ) => getSiteSlug( state, siteId ) );
	const siteUrl = useSelector( ( state: IAppState ) => siteId && getSiteUrl( state, siteId ) );
	const freeTrialPlanSlugs = useFreeTrialPlanSlugs( {
		intent: intent ?? 'default',
		eligibleForFreeHostingTrial,
	} );
	const currentPlanManageHref = useCurrentPlanManageHref();
	const canUserManageCurrentPlan = useSelector( ( state: IAppState ) =>
		siteId
			? ! isCurrentPlanPaid( state, siteId ) || isCurrentUserCurrentPlanOwner( state, siteId )
			: null
	);
	const handleUpgradeClick = useUpgradeHandler( {
		siteSlug,
		coupon,
		cartHandler,
		redirectTo,
		pluginSlug,
		checkoutAttribution,
	} );
	const handleDowngradeClick = useDowngradeHandler( {
		siteSlug,
		siteUrl: siteUrl || '',
		currentPlan,
	} );

	return ( { planSlug, cartItemForPlan, selectedStorageAddOn, availableForPurchase } ) =>
		async () => {
			const planConstantObj = applyTestFiltersToPlansList( planSlug, undefined );
			const freeTrialPlanSlug = freeTrialPlanSlugs?.[ planConstantObj.type ];

			const earlyReturn = await showModalAndExit?.( planSlug );
			if ( earlyReturn ) {
				return;
			}

			/* 1. Send user to VIP if it's an enterprise plan */
			if ( isWpcomEnterpriseGridPlan( planSlug ) ) {
				recordTracksEvent( 'calypso_plan_step_enterprise_click', { flow: flowName } );
				const vipLandingPageURL = 'https://wpvip.com/wordpress-vip-agile-content-platform';
				window.open(
					`${ vipLandingPageURL }/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=calypso_signup`,
					'_blank'
				);
				return;
			}

			/* 2. In the logged-in plans dashboard, send user to either manage add-ons or manage plan in case of current plan selection */
			if (
				sitePlanSlug &&
				currentPlan?.productSlug === planSlug &&
				! flowName &&
				intent !== 'plans-p2'
			) {
				if ( isFreePlan( planSlug ) ) {
					page.redirect( `/add-ons/${ siteSlug }` );
				} else {
					page.redirect( currentPlanManageHref );
				}
				return;
			}

			// Only the plan's owner can change it, and its buttons are disabled for anyone else.
			if ( sitePlanSlug && ! flowName && intent !== 'plans-p2' && ! canUserManageCurrentPlan ) {
				return;
			}
			/* 3. In the logged-in plans dashboard, handle plan downgrades and plan downgrade tracks events */
			if (
				sitePlanSlug &&
				( ! flowName ||
					intent === 'plans-woo-hosted' ||
					intent === 'plans-upgrade-or-downgrade' ) &&
				intent !== 'plans-p2' &&
				! availableForPurchase
			) {
				recordTracksEvent?.( 'calypso_plan_features_downgrade_click', {
					current_plan: sitePlanSlug,
					downgrading_to: planSlug,
				} );
				handleDowngradeClick( planSlug );
				return;
			}

			/* 4. Handle plan upgrade and plan upgrade tracks events */
			if ( isFreePlan( planSlug ) ) {
				recordTracksEvent( 'calypso_signup_free_plan_click' );
			} else {
				recordTracksEvent?.( 'calypso_plan_features_upgrade_click', {
					current_plan: sitePlanSlug,
					upgrading_to: planSlug,
					saw_free_trial_offer: !! freeTrialPlanSlug,
				} );
			}

			handleUpgradeClick( {
				cartItemForPlan,
				selectedStorageAddOn,
			} );
			return;
		};
}

export default useGenerateActionCallback;
