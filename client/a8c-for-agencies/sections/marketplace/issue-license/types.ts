import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

export type SelectedLicenseProp = APIProductFamilyProduct & {
	quantity: number;
	siteUrls?: string[];
};
