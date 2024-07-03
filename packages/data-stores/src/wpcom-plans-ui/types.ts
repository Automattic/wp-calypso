import type { StorageAddOnSlug } from '../add-ons/types';
import type { PlanSlug, WPComPlanStorageFeatureSlug } from '@automattic/calypso-products';

export interface DomainUpsellDialog {
	show: boolean;
}

type SiteId = string;

export interface SelectedStorageOptionForPlan {
	[ key: SiteId ]: {
		[ key in PlanSlug ]: StorageAddOnSlug | WPComPlanStorageFeatureSlug;
	};
}
