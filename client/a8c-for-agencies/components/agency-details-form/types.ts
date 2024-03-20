export interface AgencyDetailsPayload {
	agencyName: string;
	businessUrl: string;
	city: string;
	line1: string;
	line2: string;
	country: string;
	postalCode: string;
	state: string;
	tos?: 'consented';
	referrer?: string;
}
