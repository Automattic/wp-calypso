import type { WPComStorageAddOnSlug } from '@automattic/calypso-products';

export interface DomainUpsellDialog {
	show: boolean;
}

export interface selectedStorageOptionForPlans {
	[ key: string ]: WPComStorageAddOnSlug;
}
