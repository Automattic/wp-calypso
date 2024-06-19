import {
	type PlanSlug,
	WPComStorageAddOnSlug,
	isWpcomEnterpriseGridPlan,
	PLAN_BUSINESS,
} from '@automattic/calypso-products';
import { PLAN_ECOMMERCE } from '@automattic/data-stores/src/plans/constants';
import { usePlansGridContext } from '../../../../grid-context';
import StorageFeatureDropdown from './storage-feature-dropdown';
import StorageFeatureLabel from './storage-feature-label';

type Props = {
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	showUpgradeableStorage: boolean;
	planSlug: PlanSlug;
	options?: {
		isTableCell?: boolean;
	};
	priceOnSeparateLine?: boolean;
};

const ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE = [ PLAN_BUSINESS, PLAN_ECOMMERCE ];

const StorageFeature = ( {
	onStorageAddOnClick,
	planSlug,
	options,
	showUpgradeableStorage,
	priceOnSeparateLine,
}: Props ) => {
	const { gridPlansIndex } = usePlansGridContext();
	const { availableForPurchase, current } = gridPlansIndex[ planSlug ];

	if ( ! options?.isTableCell && isWpcomEnterpriseGridPlan( planSlug ) ) {
		return null;
	}

	/**
	 * The current plan is not marked as `availableForPurchase`, hence check on `current`.
	 */
	const canUpgradeStorageForPlan =
		( current || availableForPurchase ) &&
		showUpgradeableStorage &&
		ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE.includes( planSlug );

	return (
		<div className="plans-grid-next-storage-feature">
			{ canUpgradeStorageForPlan ? (
				<StorageFeatureDropdown
					planSlug={ planSlug }
					onStorageAddOnClick={ onStorageAddOnClick }
					priceOnSeparateLine={ priceOnSeparateLine }
				/>
			) : (
				<StorageFeatureLabel planSlug={ planSlug } />
			) }
		</div>
	);
};

export default StorageFeature;
