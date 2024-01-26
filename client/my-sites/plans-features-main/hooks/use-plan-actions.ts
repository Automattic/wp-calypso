import {
	PLAN_FREE,
	PRODUCT_1GB_SPACE,
	type PlanSlug,
	isWpcomEnterpriseGridPlan,
	isFreePlan,
	getPlanPath,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { WpcomPlansUI } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useMemo, useCallback } from '@wordpress/element';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks'; //TODO: move this out
import { getPlanCartItem } from 'calypso/lib/cart-values/cart-items';
import { addQueryArgs } from 'calypso/lib/url';
import useCurrentPlanManageHref from './use-current-plan-manage-href';
import type { GridPlan, PlanActions, PlansIntent } from '@automattic/plans-grid-next';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

function useUpgradeHandler(
	sitePlanSlug?: PlanSlug | null,
	flowName?: string | null,
	siteSlug?: string | null,
	withDiscount?: string,
	planActionCallback?: ( planSlug: PlanSlug ) => void,
	cartHandler?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void
) {
	// TODO:
	// - clickedPlanSlug can likely be removed
	// - those `recordTracksEvent` should be moved out
	const processCartItems = useCallback(
		( cartItems?: MinimalRequestCartProduct[] | null, clickedPlanSlug?: PlanSlug ) => {
			const cartItemForPlan = getPlanCartItem( cartItems );
			const planSlug = clickedPlanSlug ?? PLAN_FREE;

			if ( isFreePlan( planSlug ) ) {
				recordTracksEvent( 'calypso_signup_free_plan_click' );
			}

			const earlyReturn = planActionCallback?.( planSlug );

			if ( earlyReturn ) {
				return;
			}

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
		},
		[ flowName, siteSlug, withDiscount, planActionCallback, cartHandler ]
	);

	const selectedStorageOptions = useSelect( ( select ) => {
		return select( WpcomPlansUI.store ).getSelectedStorageOptions();
	}, [] );

	const addSelectedPlanAndStorageAddon = useCallback(
		( gridPlan: GridPlan, isFreeTrialPlan?: boolean ) => {
			const { planSlug, freeTrialPlanSlug } = gridPlan;

			if ( isFreeTrialPlan && freeTrialPlanSlug ) {
				const freeTrialCartItem = { product_slug: freeTrialPlanSlug };
				processCartItems?.( [ freeTrialCartItem ], freeTrialPlanSlug );
				return;
			}

			const selectedStorageOption = selectedStorageOptions?.[ planSlug ];
			const { cartItemForPlan, storageAddOnsForPlan } = gridPlan;
			const storageAddOn = storageAddOnsForPlan?.find( ( addOn ) => {
				return selectedStorageOption && addOn
					? addOn.featureSlugs?.includes( selectedStorageOption )
					: false;
			} );
			const storageAddOnCartItem = storageAddOn &&
				! storageAddOn.purchased && {
					product_slug: storageAddOn.productSlug,
					quantity: storageAddOn.quantity,
					volume: 1,
					extra: { feature_slug: selectedStorageOption },
				};

			if ( cartItemForPlan ) {
				processCartItems?.(
					[ cartItemForPlan, ...( storageAddOnCartItem ? [ storageAddOnCartItem ] : [] ) ],
					planSlug
				);
				return;
			}

			processCartItems?.( null, planSlug );
		},
		[ processCartItems, selectedStorageOptions ]
	);

	return useCallback(
		( gridPlan: GridPlan ) => {
			const { planSlug, freeTrialPlanSlug } = gridPlan;

			return ( isFreeTrialPlan?: boolean ) => {
				const upgradePlan = isFreeTrialPlan && freeTrialPlanSlug ? freeTrialPlanSlug : planSlug;

				if ( ! isFreePlan( planSlug ) ) {
					recordTracksEvent?.( 'calypso_plan_features_upgrade_click', {
						current_plan: sitePlanSlug,
						upgrading_to: upgradePlan,
						saw_free_trial_offer: !! freeTrialPlanSlug,
					} );
				}
				addSelectedPlanAndStorageAddon?.( gridPlan, isFreeTrialPlan );
			};
		},
		[ sitePlanSlug, addSelectedPlanAndStorageAddon ]
	);
}

function usePlanActions(
	gridPlans: GridPlan[],
	intent?: PlansIntent | null,
	flowName?: string | null,
	sitePlanSlug?: PlanSlug | null,
	siteSlug?: string | null,
	withDiscount?: string,
	planActionCallback?: ( planSlug: PlanSlug ) => void,
	cartHandler?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void
): PlanActions {
	const upgradeHandler = useUpgradeHandler(
		sitePlanSlug,
		flowName,
		siteSlug,
		withDiscount,
		planActionCallback,
		cartHandler
	);

	const currentPlanManageHref = useCurrentPlanManageHref();

	const managePlan = () => page( currentPlanManageHref );
	const manageAddon = () => page.redirect( `/add-ons/${ siteSlug }` );
	const gotoVip = () => {
		recordTracksEvent( 'calypso_plan_step_enterprise_click', { flow: flowName } );
		window.open( 'https://wpvip.com/wordpress-vip-agile-content-platform', '_blank' );
	};

	return useMemo( () => {
		return gridPlans.reduce( ( acc, gridPlan ) => {
			const { planSlug } = gridPlan;

			let handler;

			if ( isWpcomEnterpriseGridPlan( planSlug ) ) {
				handler = gotoVip;
			}
			if ( sitePlanSlug && intent !== 'plans-p2' ) {
				if ( isFreePlan( sitePlanSlug ) ) {
					handler = manageAddon;
				} else {
					handler = managePlan;
				}
			} else {
				handler = upgradeHandler( gridPlan );
			}

			return {
				...acc,
				[ planSlug ]: handler,
			};
		}, {} );
	}, [ gridPlans ] );
}

export default usePlanActions;
