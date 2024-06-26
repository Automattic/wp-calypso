import {
	type PlanSlug,
	WPComStorageAddOnSlug,
	isWpcomEnterpriseGridPlan,
} from '@automattic/calypso-products';
import { usePlansGridContext } from '../../../../grid-context';
import { isStorageUpgradeableForPlan } from '../../../../lib/is-storage-upgradeable-for-plan';
import useAvailableStorageOptions from '../hooks/use-available-storage-options';
import PlanStorageLabel from './plan-storage-label';
import StorageAddOnDropdown from './storage-add-on-dropdown';

type Props = {
	intervalType: string;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	showUpgradeableStorage: boolean;
	planSlug: PlanSlug;
	options?: {
		isTableCell?: boolean;
	};
	priceOnSeparateLine?: boolean;
};

const StorageFeature = ( {
	intervalType,
	onStorageAddOnClick,
	planSlug,
	options,
	showUpgradeableStorage,
	priceOnSeparateLine,
}: Props ) => {
	const { gridPlansIndex } = usePlansGridContext();
	const { availableForPurchase, current } = gridPlansIndex[ planSlug ];

	/**
	 * TODO: Consider centralising `canUpgradeStorageForPlan` behind `availableStorageOptions`
	 */
	const availableStorageOptions = useAvailableStorageOptions( { planSlug } );

	if ( ! options?.isTableCell && isWpcomEnterpriseGridPlan( planSlug ) ) {
		return null;
	}

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
			priceOnSeparateLine={ priceOnSeparateLine }
		/>
	) : (
		availableStorageOptions.map( ( storageOption ) => {
			if ( ! storageOption?.isAddOn ) {
				return <PlanStorageLabel storageOption={ storageOption } planSlug={ planSlug } />;
			}
		} )
	);

	return <div className="plans-grid-next-storage-feature">{ storageJSX }</div>;
};

export default StorageFeature;
