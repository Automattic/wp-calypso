import { PlanSlug, StorageOption, isWpcomEnterpriseGridPlan } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import StorageAddOnDropdown from '../components/storage-add-on-dropdown';
import { PlanRowOptions } from '../types';
import { getStorageStringFromFeature } from '../util';
import { Container } from './container';

interface Props {
	intervalType?: string;
	showUpgradeableStorage: boolean;
	planSlug: PlanSlug;
	options?: PlanRowOptions;
	storageOptions: StorageOption[];
}

export default function PlanStorageOptions( {
	intervalType,
	showUpgradeableStorage,
	options,
	planSlug,
	storageOptions,
}: Props ) {
	const translate = useTranslate();

	if ( ! options?.isTableCell && isWpcomEnterpriseGridPlan( planSlug ) ) {
		return null;
	}

	const shouldRenderStorageTitle =
		storageOptions.length === 1 ||
		( intervalType !== 'yearly' && storageOptions.length > 0 ) ||
		( ! showUpgradeableStorage && storageOptions.length > 0 );
	const canUpgradeStorageForPlan =
		storageOptions.length > 1 && intervalType === 'yearly' && showUpgradeableStorage;

	const storageJSX = canUpgradeStorageForPlan ? (
		<StorageAddOnDropdown planSlug={ planSlug } storageOptions={ storageOptions } />
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
		<Container
			key={ planSlug }
			className="plan-features-2023-grid__table-item plan-features-2023-grid__storage"
			isTableCell={ options?.isTableCell }
		>
			{ shouldRenderStorageTitle ? (
				<div className="plan-features-2023-grid__storage-title">{ translate( 'Storage' ) }</div>
			) : null }
			{ storageJSX }
		</Container>
	);
}
