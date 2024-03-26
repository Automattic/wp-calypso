import {
	PLAN_FREE,
	PRODUCT_1GB_SPACE,
	type PlanSlug,
	isWpcomEnterpriseGridPlan,
	isFreePlan,
	getPlanPath,
	WPComStorageAddOnSlug,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { useMemo, useCallback } from '@wordpress/element';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks'; //TODO: move this out
import { getPlanCartItem } from 'calypso/lib/cart-values/cart-items';
import { addQueryArgs } from 'calypso/lib/url';
import useCurrentPlanManageHref from './use-current-plan-manage-href';
import type { GridPlan, PlansIntent } from '@automattic/plans-grid-next';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

function useUpgradeHandler(
	siteId?: number | null,
	sitePlanSlug?: PlanSlug | null,
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
		[ siteSlug, withDiscount, planActionCallback, cartHandler ]
	);

	const addSelectedPlanAndStorageAddon = useCallback(
		( gridPlan: GridPlan, isFreeTrialPlan?: boolean, storageAddOn?: WPComStorageAddOnSlug ) => {
			const { planSlug, freeTrialPlanSlug } = gridPlan;

			if ( isFreeTrialPlan && freeTrialPlanSlug ) {
				const freeTrialCartItem = { product_slug: freeTrialPlanSlug };
				processCartItems?.( [ freeTrialCartItem ], freeTrialPlanSlug );
				return;
			}

			const { cartItemForPlan, storageAddOnsForPlan } = gridPlan;

			const selectedStorageAddOn = storageAddOnsForPlan?.find( ( addOn ) => {
				return storageAddOn && addOn ? addOn.featureSlugs?.includes( storageAddOn ) : false;
			} );

			const storageAddOnCartItem = selectedStorageAddOn &&
				! selectedStorageAddOn.purchased && {
					product_slug: selectedStorageAddOn.productSlug,
					quantity: selectedStorageAddOn.quantity,
					volume: 1,
					extra: { feature_slug: storageAddOn },
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
		[ processCartItems ]
	);

	return useCallback(
		( gridPlan: GridPlan ) => {
			const { planSlug, freeTrialPlanSlug } = gridPlan;

			return (
				{
					isFreeTrialPlan,
					storageAddOn,
				}: {
					isFreeTrialPlan?: boolean;
					storageAddOn?: WPComStorageAddOnSlug;
				} = { isFreeTrialPlan: false, storageAddOn: undefined }
			) => {
				const upgradePlan = isFreeTrialPlan && freeTrialPlanSlug ? freeTrialPlanSlug : planSlug;

				if ( ! isFreePlan( planSlug ) ) {
					recordTracksEvent?.( 'calypso_plan_features_upgrade_click', {
						current_plan: sitePlanSlug,
						upgrading_to: upgradePlan,
						saw_free_trial_offer: !! freeTrialPlanSlug,
					} );
				}
				addSelectedPlanAndStorageAddon?.( gridPlan, isFreeTrialPlan, storageAddOn );
			};
		},
		[ sitePlanSlug, addSelectedPlanAndStorageAddon ]
	);
}

function useActionCallback(
	intent?: PlansIntent | null,
	flowName?: string | null,
	siteId?: number | null,
	sitePlanSlug?: PlanSlug | null,
	siteSlug?: string | null,
	withDiscount?: string,
	planActionCallback?: ( planSlug: PlanSlug ) => void,
	cartHandler?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void
) {
	const upgradeHandler = useUpgradeHandler(
		siteId,
		sitePlanSlug,
		siteSlug,
		withDiscount,
		planActionCallback,
		cartHandler
	);

	const currentPlanManageHref = useCurrentPlanManageHref();

	const [ managePlan, manageAddon, gotoVip ] = useMemo( () => {
		const composePlanActionCallback = ( callback: () => void ) => {
			return ( gridPlan: GridPlan ) => {
				const earlyReturn = planActionCallback?.( gridPlan.planSlug );

				if ( earlyReturn ) {
					return;
				}

				callback();
			};
		};
		const managePlan = composePlanActionCallback( () => page( currentPlanManageHref ) );
		const manageAddon = composePlanActionCallback( () =>
			page.redirect( `/add-ons/${ siteSlug }` )
		);
		const gotoVip = composePlanActionCallback( () => {
			recordTracksEvent( 'calypso_plan_step_enterprise_click', { flow: flowName } );
			window.open( 'https://wpvip.com/wordpress-vip-agile-content-platform', '_blank' );
		} );

		return [ managePlan, manageAddon, gotoVip ];
	}, [ currentPlanManageHref, flowName, planActionCallback, siteSlug ] );

	return ( gridPlan: GridPlan ) => {
		if ( isWpcomEnterpriseGridPlan( gridPlan.planSlug ) ) {
			return gotoVip;
		}

		if ( sitePlanSlug && gridPlan.current && intent !== 'plans-p2' ) {
			return isFreePlan( sitePlanSlug ) ? manageAddon : managePlan;
		}

		return upgradeHandler( gridPlan );
	};
}

export default useActionCallback;
