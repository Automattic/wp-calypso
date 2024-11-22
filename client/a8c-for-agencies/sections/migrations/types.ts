export interface MigrationCommissionItem {
	id: number;
	siteUrl: string;
	migratedOn: Date;
	reviewStatus: 'confirmed' | 'pending' | 'rejected';
}

export interface MigrationCommissionAPIResponse {
	// TODO: Define the API response shape
}
