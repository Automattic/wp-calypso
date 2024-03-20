import type { PlanSlug, WPComStorageAddOnSlug } from '@automattic/calypso-products';

export interface DomainUpsellDialog {
	show: boolean;
}

type SiteId = string;

export interface SelectedStorageOptionForPlans {
	[ key: SiteId ]: {
		[ key in PlanSlug ]: WPComStorageAddOnSlug;
	};
}
