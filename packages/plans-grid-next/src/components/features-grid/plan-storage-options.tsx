import {
	type PlanSlug,
	WPComStorageAddOnSlug,
	isWpcomEnterpriseGridPlan,
} from '@automattic/calypso-products';
import { usePlansGridContext } from '../../grid-context';
import { isStorageUpgradeableForPlan } from '../../lib/is-storage-upgradeable-for-plan';
import { PlanFeaturesItem } from '../item';
import { PlanStorageLabel, useGetAvailableStorageOptions } from '../storage';
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
		current,
	} = gridPlansIndex[ planSlug ];
	const getAvailableStorageOptions = useGetAvailableStorageOptions();

	if ( ! options?.isTableCell && isWpcomEnterpriseGridPlan( planSlug ) ) {
		return null;
	}

	/**
	 * TODO: Consider centralising `canUpgradeStorageForPlan` behind `availableStorageOptions`
	 */
	const availableStorageOptions = getAvailableStorageOptions( { storageOptions } );
	/**
	 * The current plan is not marked as `availableForPurchase`, hence check on `current`.
	 */
	const canUpgradeStorageForPlan =
		( current || availableForPurchase ) &&
		isStorageUpgradeableForPlan( {
			intervalType,
			showUpgradeableStorage,
			storageOptions: availableStorageOptions,
		} );

	const storageJSX = canUpgradeStorageForPlan ? (
		<StorageAddOnDropdown
			planSlug={ planSlug }
			onStorageAddOnClick={ onStorageAddOnClick }
			storageOptions={ availableStorageOptions }
		/>
	) : (
		storageOptions.map( ( storageOption ) => {
			if ( ! storageOption?.isAddOn ) {
				return <PlanStorageLabel storageOption={ storageOption } planSlug={ planSlug } />;
			}
		} )
	);

	return (
		<div className="plan-features-2023-grid__storage">
			<PlanFeaturesItem>{ storageJSX }</PlanFeaturesItem>
		</div>
	);
};

export default PlanStorageOptions;
