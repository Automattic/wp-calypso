import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	applyTestFiltersToPlansList,
	PRODUCT_1GB_SPACE,
	type PlanSlug,
	isWpcomEnterpriseGridPlan,
	isFreePlan,
	getPlanPath,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { AddOns, Plans } from '@automattic/data-stores';
import { useCallback } from '@wordpress/element';
import { getPlanCartItem } from 'calypso/lib/cart-values/cart-items';
import { addQueryArgs } from 'calypso/lib/url';
import { useFreeTrialPlanSlugs } from 'calypso/my-sites/plans-features-main/hooks/use-free-trial-plan-slugs';
import useCurrentPlanManageHref from './use-current-plan-manage-href';
import type {
	UseActionCallbackParams,
	PlansIntent,
	UseActionCallback,
} from '@automattic/plans-grid-next';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

function useUpgradeHandler( {
	siteSlug,
	withDiscount,
	cartHandler,
}: {
	siteSlug?: string | null;
	withDiscount?: string;
	cartHandler?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void;
} ) {
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

			const planPath = cartItemForPlan?.product_slug
				? getPlanPath( cartItemForPlan.product_slug )
				: '';

			const checkoutUrl = cartItemForStorageAddOn
				? `/checkout/${ siteSlug }/${ planPath },${ cartItemForStorageAddOn.product_slug }:-q-${ cartItemForStorageAddOn.quantity }`
				: `/checkout/${ siteSlug }/${ planPath }`;

			const checkoutUrlWithArgs = addQueryArgs(
				{ ...( withDiscount && { coupon: withDiscount } ) },
				checkoutUrl
			);

			page( checkoutUrlWithArgs );
			return;
		},
		[ siteSlug, withDiscount, cartHandler ]
	);

	return useCallback(
		( {
			cartItemForPlan,
			isFreeTrialCta,
			selectedStorageAddOn,
		}: {
			cartItemForPlan?: MinimalRequestCartProduct | null;
			isFreeTrialCta: boolean | undefined;
			selectedStorageAddOn?: AddOns.AddOnMeta | null;
		} ) => {
			/* 1. Process free trial plan for checkout. Exclude add-ons. */
			if ( isFreeTrialCta && cartItemForPlan ) {
				processCartItems?.( [ cartItemForPlan ] );
				return;
			}

			/* 2. Process plan and add-ons for checkout. */
			const storageAddOnCartItem = selectedStorageAddOn &&
				! selectedStorageAddOn.purchased && {
					product_slug: selectedStorageAddOn.productSlug,
					quantity: selectedStorageAddOn.quantity,
					volume: 1,
					extra: { feature_slug: selectedStorageAddOn?.featureSlugs?.[ 0 ] },
				};

			if ( cartItemForPlan ) {
				processCartItems?.( [
					cartItemForPlan,
					...( storageAddOnCartItem ? [ storageAddOnCartItem ] : [] ),
				] );
				return;
			}

			/* 3. Process free plan for checkout */
			processCartItems?.( null );
			return;
		},
		[ processCartItems ]
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
	siteSlug,
	withDiscount,
}: {
	// TODO: Reevaluate param types and whether or not they should be optional
	currentPlan: Plans.SitePlan | undefined;
	eligibleForFreeHostingTrial: boolean;
	cartHandler?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void;
	flowName?: string | null;
	intent?: PlansIntent | null;
	showModalAndExit?: ( planSlug: PlanSlug ) => boolean;
	sitePlanSlug?: PlanSlug | null;
	siteSlug?: string | null;
	withDiscount?: string;
} ): UseActionCallback {
	const freeTrialPlanSlugs = useFreeTrialPlanSlugs( {
		intent: intent ?? 'default',
		eligibleForFreeHostingTrial,
	} );
	const currentPlanManageHref = useCurrentPlanManageHref();
	const handleUpgrade = useUpgradeHandler( { siteSlug, withDiscount, cartHandler } );

	return ( { planSlug, cartItemForPlan, selectedStorageAddOn }: UseActionCallbackParams ) => {
		return ( isFreeTrialCta?: boolean ) => {
			const planConstantObj = applyTestFiltersToPlansList( planSlug, undefined );
			const freeTrialPlanSlug = freeTrialPlanSlugs?.[ planConstantObj.type ];
			let upgradePlanSlug = planSlug;
			let upgradeCartItem = cartItemForPlan;

			if ( isFreeTrialCta ) {
				upgradePlanSlug = freeTrialPlanSlug as PlanSlug;
				upgradeCartItem = { product_slug: freeTrialPlanSlug as PlanSlug };
			}

			const earlyReturn = upgradePlanSlug && showModalAndExit?.( upgradePlanSlug );
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

			/* 2. Send user to either manage add-ons or plan in case of current plan selection */
			if ( sitePlanSlug && currentPlan?.productSlug === planSlug && intent !== 'plans-p2' ) {
				if ( isFreePlan( planSlug ) ) {
					page.redirect( `/add-ons/${ siteSlug }` );
				} else {
					page.redirect( currentPlanManageHref );
				}
				return;
			}

			/* 3. Handle plan upgrade and plan upgrade tracks events */
			switch ( ! isFreePlan( upgradePlanSlug ) ) {
				case true:
					recordTracksEvent?.( 'calypso_plan_features_upgrade_click', {
						current_plan: sitePlanSlug,
						upgrading_to: upgradePlanSlug,
						saw_free_trial_offer: !! freeTrialPlanSlug,
					} );
				case false:
					recordTracksEvent( 'calypso_signup_free_plan_click' );
				default:
					handleUpgrade( {
						cartItemForPlan: upgradeCartItem,
						isFreeTrialCta,
						selectedStorageAddOn,
					} );
			}
			return;
		};
	};
}

export default useGenerateActionCallback;
