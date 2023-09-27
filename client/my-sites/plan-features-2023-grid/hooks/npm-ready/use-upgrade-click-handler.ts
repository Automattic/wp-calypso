import { isFreePlan, type PlanSlug } from '@automattic/calypso-products';
import { WpcomPlansUI } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import type { GridPlan } from './data-store/use-grid-plans';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

interface Props {
	gridPlansForFeaturesGrid: GridPlan[]; // TODO clk: to be removed, grabbed from context
	onUpgradeClick?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void;
}

const useUpgradeClickHandler = ( { gridPlansForFeaturesGrid, onUpgradeClick }: Props ) => {
	const selectedStorageOptions = useSelect( ( select ) => {
		return select( WpcomPlansUI.store ).getSelectedStorageOptions();
	}, [] );

	return useCallback(
		( planSlug: PlanSlug ) => {
			const selectedStorageOption = selectedStorageOptions?.[ planSlug ];
			const { cartItemForPlan, storageAddOnsForPlan } =
				gridPlansForFeaturesGrid.find( ( gridPlan ) => gridPlan.planSlug === planSlug ) ?? {};
			const storageAddOn = storageAddOnsForPlan?.find( ( addOn ) => {
				return selectedStorageOption && addOn
					? addOn.featureSlugs?.includes( selectedStorageOption )
					: false;
			} );
			const storageAddOnCartItem = storageAddOn && {
				product_slug: storageAddOn.productSlug,
				quantity: storageAddOn.quantity,
				volume: 1,
			};

			if ( cartItemForPlan ) {
				onUpgradeClick?.( [
					cartItemForPlan,
					...( storageAddOnCartItem ? [ storageAddOnCartItem ] : [] ),
				] );
				return;
			}

			if ( isFreePlan( planSlug ) ) {
				onUpgradeClick?.( null );
				return;
			}
		},
		[ gridPlansForFeaturesGrid, onUpgradeClick, selectedStorageOptions ]
	);
};

export default useUpgradeClickHandler;
