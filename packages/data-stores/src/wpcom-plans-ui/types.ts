import type {
	PlanSlug,
	WPComPlanStorageFeatureSlug,
	WPComStorageAddOnSlug,
} from '@automattic/calypso-products';

export interface DomainUpsellDialog {
	show: boolean;
}

type SiteId = string;

export interface SelectedStorageOptionForPlan {
	[ key: SiteId ]: {
		[ key in PlanSlug ]: WPComStorageAddOnSlug | WPComPlanStorageFeatureSlug;
	};
}
