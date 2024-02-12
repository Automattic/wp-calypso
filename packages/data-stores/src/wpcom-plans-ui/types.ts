import type { WPComStorageAddOnSlug } from '@automattic/calypso-products';

export interface DomainUpsellDialog {
	show: boolean;
}

export interface SelectedStorageOptionForPlans {
	// TODO: Review the types here
	[ key: string ]: {
		[ key: string ]: WPComStorageAddOnSlug;
	};
}
