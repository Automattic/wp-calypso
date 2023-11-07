import { isFreeHostingTrial, isFreePlan, type PlanSlug } from '@automattic/calypso-products';
import { WpcomPlansUI } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import type { GridPlan } from './data-store/use-grid-plans';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

interface Props {
	gridPlans: GridPlan[]; // TODO clk: to be removed, grabbed from context
	onUpgradeClick?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void;
}

const useUpgradeClickHandler = ( { gridPlans, onUpgradeClick }: Props ) => {
	const selectedStorageOptions = useSelect( ( select ) => {
		return select( WpcomPlansUI.store ).getSelectedStorageOptions();
	}, [] );

	return useCallback(
		( planSlug: PlanSlug ) => {
			const selectedStorageOption = selectedStorageOptions?.[ planSlug ];
			const { cartItemForPlan, storageAddOnsForPlan } =
				gridPlans.find( ( gridPlan ) => gridPlan.planSlug === planSlug ) ?? {};
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
				onUpgradeClick?.( [
					cartItemForPlan,
					...( storageAddOnCartItem ? [ storageAddOnCartItem ] : [] ),
				] );
				return;
			}

			if ( isFreeHostingTrial( planSlug ) ) {
				const cartItemForPlan = { product_slug: planSlug };
				onUpgradeClick?.( [ cartItemForPlan ] );
				return;
			}

			if ( isFreePlan( planSlug ) ) {
				onUpgradeClick?.( null );
				return;
			}
		},
		[ gridPlans, onUpgradeClick, selectedStorageOptions ]
	);
};

export default useUpgradeClickHandler;
