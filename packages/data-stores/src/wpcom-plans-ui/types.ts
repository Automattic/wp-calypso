import type { WPComStorageAddOnSlug } from '@automattic/calypso-products';

export interface DomainUpsellDialog {
	show: boolean;
}

export interface selectedStorageAddOnsForPlans {
	[ key: string ]: WPComStorageAddOnSlug | null;
}
