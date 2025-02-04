import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

export type SelectedLicenseProp = APIProductFamilyProduct & {
	quantity: number;
	siteUrls?: string[];
};

export interface IssueLicenseContext {
	selectedLicenses: SelectedLicenseProp[];
	setSelectedLicenses: ( selectedLicenses: SelectedLicenseProp[] ) => void;
}
