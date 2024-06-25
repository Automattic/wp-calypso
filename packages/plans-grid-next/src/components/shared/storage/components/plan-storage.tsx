import {
	type PlanSlug,
	WPComStorageAddOnSlug,
	isWpcomEnterpriseGridPlan,
} from '@automattic/calypso-products';
import { AddOns } from '@automattic/data-stores';
import { usePlansGridContext } from '../../../../grid-context';
import StorageDropdown from './storage-dropdown';
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

const PlanStorage = ( {
	onStorageAddOnClick,
	planSlug,
	options,
	showUpgradeableStorage,
	priceOnSeparateLine,
}: Props ) => {
	const { siteId, gridPlansIndex } = usePlansGridContext();
	const { availableForPurchase, current } = gridPlansIndex[ planSlug ];
	const availableStorageAddOns = AddOns.useAvailableStorageAddOns( { planSlug, siteId } );

	if ( ! options?.isTableCell && isWpcomEnterpriseGridPlan( planSlug ) ) {
		return null;
	}

	/**
	 * The current plan is not marked as `availableForPurchase`, hence check on `current`.
	 */
	const canUpgradeStorageForPlan =
		( current || availableForPurchase ) && showUpgradeableStorage && availableStorageAddOns;

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
