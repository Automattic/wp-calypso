import { PlanSlug, StorageOption } from '@automattic/calypso-products';
import { usePlansGridContext } from '../../../grid-context';
import useStorageStringFromFeature from '../hooks/use-storage-string-from-feature';

interface Props {
	storageOption: StorageOption;
	planSlug: PlanSlug;
}

const PlanStorageLabel = ( { storageOption, planSlug }: Props ) => {
	const { siteId } = usePlansGridContext();
	const storageStringFromFeature = useStorageStringFromFeature( {
		siteId,
		storageFeature: storageOption.slug,
		planSlug,
	} );

	return (
		<div className="plan-features-2023-grid__storage-buttons" key={ storageOption.slug }>
			{ storageStringFromFeature }
		</div>
	);
};

export default PlanStorageLabel;
