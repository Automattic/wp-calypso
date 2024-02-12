import type { PlanSlug, WPComStorageAddOnSlug } from '@automattic/calypso-products';

export interface DomainUpsellDialog {
	show: boolean;
}

export interface SelectedStorageOptionForPlans {
	[ key: string ]: {
		[ key in PlanSlug ]: WPComStorageAddOnSlug;
	};
}
