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

export interface PartnerState {
	isFetching: boolean;
	activePartnerKey: number;
	current: Partner | null;
	error: string;
}

export interface PartnerPortalState {
	partner: PartnerState;
}

export interface PartnerPortalStore {
	partnerPortal: PartnerPortalState;
}
