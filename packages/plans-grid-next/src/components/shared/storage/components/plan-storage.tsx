import { type PlanSlug, isWpcomEnterpriseGridPlan } from '@automattic/calypso-products';
import { AddOns } from '@automattic/data-stores';
import { usePlansGridContext } from '../../../../grid-context';
import { ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE } from '../constants';
import StorageDropdown from './storage-dropdown';
import StorageFeatureLabel from './storage-feature-label';

type Props = {
	onStorageAddOnClick?: ( addOnSlug: AddOns.StorageAddOnSlug ) => void;
	showUpgradeableStorage: boolean;
	planSlug: PlanSlug;
	options?: {
		isTableCell?: boolean;
	};
	priceOnSeparateLine?: boolean;
};

const PlanStorage = ( {
	onStorageAddOnClick,
	planSlug,
	options,
	showUpgradeableStorage,
	priceOnSeparateLine,
}: Props ) => {
	const { siteId, gridPlansIndex } = usePlansGridContext();
	const { availableForPurchase, current } = gridPlansIndex[ planSlug ];
	const availableStorageAddOns = AddOns.useAvailableStorageAddOns( { siteId } );

	if ( ! options?.isTableCell && isWpcomEnterpriseGridPlan( planSlug ) ) {
		return null;
	}

	/**
	 * The current plan is not marked as `availableForPurchase`, hence check on `current`.
	 */
	const canUpgradeStorageForPlan =
		( current || availableForPurchase ) &&
		showUpgradeableStorage &&
		availableStorageAddOns.length &&
		ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE.includes( planSlug );

	return (
		<div className="plans-grid-next-plan-storage">
			{ canUpgradeStorageForPlan ? (
				<StorageDropdown
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

export default PlanStorage;
