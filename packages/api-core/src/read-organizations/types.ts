export interface ReaderOrganization {
	id: number;
	title: string;
	slug: string;
	sites_count: number;
}

export interface ReaderOrganizationsResponse {
	organizations: ReaderOrganization[];
}
