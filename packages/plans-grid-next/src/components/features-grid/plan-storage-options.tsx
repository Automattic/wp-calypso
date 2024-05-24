import {
	type PlanSlug,
	WPComStorageAddOnSlug,
	isWpcomEnterpriseGridPlan,
} from '@automattic/calypso-products';
import { usePlansGridContext } from '../../grid-context';
import { isStorageUpgradeableForPlan } from '../../lib/is-storage-upgradeable-for-plan';
import { getStorageStringFromFeature } from '../../util';
import { PlanFeaturesItem } from '../item';
import StorageAddOnDropdown from '../storage-add-on-dropdown';

type PlanStorageOptionsProps = {
	intervalType: string;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	showUpgradeableStorage: boolean;
	planSlug: PlanSlug;
	options?: {
		isTableCell?: boolean;
	};
};

const PlanStorageOptions = ( {
	intervalType,
	onStorageAddOnClick,
	planSlug,
	options,
	showUpgradeableStorage,
}: PlanStorageOptionsProps ) => {
	const { gridPlansIndex } = usePlansGridContext();
	const {
		availableForPurchase,
		features: { storageOptions },
	} = gridPlansIndex[ planSlug ];
	const canUpgradeStorageForPlan = isStorageUpgradeableForPlan( {
		intervalType,
		showUpgradeableStorage,
		storageOptions,
	} );

	const storageJSX =
		canUpgradeStorageForPlan && availableForPurchase ? (
			<StorageAddOnDropdown
				planSlug={ planSlug }
				onStorageAddOnClick={ onStorageAddOnClick }
				storageOptions={ storageOptions }
			/>
		) : (
			storageOptions.map( ( storageOption ) => {
				if ( ! storageOption?.isAddOn ) {
					return (
						<div className="plan-features-2023-grid__storage-buttons" key={ planSlug }>
							{ getStorageStringFromFeature( storageOption?.slug ) }
						</div>
					);
				}
			} )
		);

	if ( ! options?.isTableCell && isWpcomEnterpriseGridPlan( planSlug ) ) {
		return null;
	}

	return (
		<div className="plan-features-2023-grid__storage">
			<PlanFeaturesItem>{ storageJSX }</PlanFeaturesItem>
		</div>
	);
};

export default PlanStorageOptions;
