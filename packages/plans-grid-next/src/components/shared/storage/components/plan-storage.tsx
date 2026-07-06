import { type PlanSlug, isWpcomEnterpriseGridPlan } from '@automattic/calypso-products';
import { AddOns } from '@automattic/data-stores';
import { useState } from '@wordpress/element';
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
};

const PlanStorage = ( {
	onStorageAddOnClick,
	planSlug,
	options,
	showUpgradeableStorage,
}: Props ) => {
	const { siteId, gridPlansIndex, showFeatureCheckmarks } = usePlansGridContext();
	const [ isStorageDropdownVisible, setIsStorageDropdownVisible ] = useState( false );
	const { availableForPurchase, current, planTitle } = gridPlansIndex[ planSlug ];
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

	let storageContent = <StorageFeatureLabel planSlug={ planSlug } />;

	if ( canUpgradeStorageForPlan && showFeatureCheckmarks && ! isStorageDropdownVisible ) {
		storageContent = (
			<StorageFeatureLabel
				planSlug={ planSlug }
				showAddMore
				onAddMoreClick={ () => setIsStorageDropdownVisible( true ) }
			/>
		);
	} else if ( canUpgradeStorageForPlan ) {
		storageContent = (
			<StorageDropdown
				planSlug={ planSlug }
				onStorageAddOnClick={ onStorageAddOnClick }
				onStorageOptionChange={
					showFeatureCheckmarks ? () => setIsStorageDropdownVisible( false ) : undefined
				}
			/>
		);
	}

	return (
		<div className="plans-grid-next-plan-storage" data-plan-title={ planTitle }>
			{ storageContent }
		</div>
	);
};

export default PlanStorage;
