export interface APIError {
	status: number;
	code: string | null;
	message: string;
}

export interface PartnerKey {
	id: number;
	name: string;
	oauth2_token: string;
	disabled_on: string | null;
}

export interface Partner {
	id: number;
	slug: string;
	name: string;
	keys: PartnerKey[];
}

export interface PartnersState {
	isFetching: boolean;
	activePartnerKey: number;
	all: Partner[];
	error: string;
}

export interface InspectLicenseState {
	licenseKey: string;
	isInspecting: boolean;
	error: string;
	result: string;
}

export interface LicensingPortalState {
	partners: PartnersState;
	inspectLicense: InspectLicenseState;
}

export interface LicensingPortalStore {
	licensingPortal: LicensingPortalState;
}
