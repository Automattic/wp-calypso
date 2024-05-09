import { WPComStorageAddOnSlug, isWpcomEnterpriseGridPlan } from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { isStorageUpgradeableForPlan } from '../../lib/is-storage-upgradeable-for-plan';
import { GridPlan } from '../../types';
import { getStorageStringFromFeature } from '../../util';
import PlanDivOrTdContainer from '../plan-div-td-container';
import StorageAddOnDropdown from '../storage-add-on-dropdown';

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

	/**
	 * This is a pretty critical and fragile, as it filters out the enterprise plan.
	 * If the plan sits anywhere else but the tail/end, it will most likely break the grid (render wrong parts at wrong places).
	 */
	const plansWithFeatures = useMemo( () => {
		return renderedGridPlans.filter(
			( gridPlan ) => ! isWpcomEnterpriseGridPlan( gridPlan.planSlug )
		);
	}, [ renderedGridPlans ] );

	return plansWithFeatures.map(
		( { availableForPurchase, planSlug, features: { storageOptions } } ) => {
			if ( ! options?.isTableCell && isWpcomEnterpriseGridPlan( planSlug ) ) {
				return null;
			}

			const shouldRenderStorageTitle =
				storageOptions.length > 0 &&
				( storageOptions.length === 1 ||
					intervalType !== 'yearly' ||
					! showUpgradeableStorage ||
					! availableForPurchase );
			const canUpgradeStorageForPlan = isStorageUpgradeableForPlan( {
				intervalType,
				showUpgradeableStorage,
				storageOptions,
			} );
			const storageJSX =
				canUpgradeStorageForPlan && availableForPurchase ? (
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
		}
	);
};

export default PlanStorageOptions;
