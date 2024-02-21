import { WPComStorageAddOnSlug, isWpcomEnterpriseGridPlan } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { isStorageUpgradeableForPlan } from '../../lib/is-storage-upgradeable-for-plan';
import { GridPlan } from '../../types';
import { getStorageStringFromFeature } from '../../util';
import PlanDivOrTdContainer from '../shared/plan-div-td-container';
import StorageAddOnDropdown from '../shared/storage-add-on-dropdown';

type PlanStorageOptionsProps = {
	intervalType: string;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	renderedGridPlans: GridPlan[];
	showUpgradeableStorage: boolean;
	options?: {
		isTableCell?: boolean;
	};
};

const PlanStorageOptions = ( {
	intervalType,
	onStorageAddOnClick,
	options,
	renderedGridPlans,
	showUpgradeableStorage,
}: PlanStorageOptionsProps ) => {
	const translate = useTranslate();

	return renderedGridPlans.map( ( { planSlug, features: { storageOptions } } ) => {
		if ( ! options?.isTableCell && isWpcomEnterpriseGridPlan( planSlug ) ) {
			return null;
		}

		const shouldRenderStorageTitle =
			storageOptions.length > 0 &&
			( storageOptions.length === 1 || intervalType !== 'yearly' || ! showUpgradeableStorage );
		const canUpgradeStorageForPlan = isStorageUpgradeableForPlan( {
			intervalType,
			showUpgradeableStorage,
			storageOptions,
		} );
		const storageJSX = canUpgradeStorageForPlan ? (
			<StorageAddOnDropdown
				label={ translate( 'Storage' ) }
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

		return (
			<PlanDivOrTdContainer
				key={ planSlug }
				className="plan-features-2023-grid__table-item plan-features-2023-grid__storage"
				isTableCell={ options?.isTableCell }
			>
				{ shouldRenderStorageTitle ? (
					<div className="plan-features-2023-grid__storage-title">{ translate( 'Storage' ) }</div>
				) : null }
				{ storageJSX }
			</PlanDivOrTdContainer>
		);
	} );
};

export default PlanStorageOptions;
