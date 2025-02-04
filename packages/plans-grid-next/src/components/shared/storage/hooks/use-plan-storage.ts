import {
	FEATURE_1GB_STORAGE,
	FEATURE_6GB_STORAGE,
	FEATURE_13GB_STORAGE,
	FEATURE_50GB_STORAGE,
	FEATURE_200GB_STORAGE,
	FEATURE_P2_3GB_STORAGE,
	FEATURE_P2_13GB_STORAGE,
	type PlanSlug,
	type WPComPlanStorageFeatureSlug,
} from '@automattic/calypso-products';
import { usePlansGridContext } from '../../../../grid-context';

function usePlanStorage( planSlug: PlanSlug ) {
	const { gridPlansIndex } = usePlansGridContext();
	const {
		features: { storageFeature },
	} = gridPlansIndex[ planSlug ];
	const storageFeatureSlug = storageFeature?.getSlug() as WPComPlanStorageFeatureSlug | undefined;

	switch ( storageFeatureSlug ) {
		case FEATURE_1GB_STORAGE:
			return 1;
		case FEATURE_6GB_STORAGE:
			return 6;
		case FEATURE_13GB_STORAGE:
			return 13;
		case FEATURE_50GB_STORAGE:
			return 50;
		case FEATURE_P2_3GB_STORAGE:
			return 3;
		case FEATURE_P2_13GB_STORAGE:
			return 13;
		case FEATURE_200GB_STORAGE:
			return 200;
		default:
			return 0;
	}
}

export default usePlanStorage;
