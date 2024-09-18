export interface CredentialsFormData {
	from_url: string;
	username: string;
	password: string;
	backupFileLocation: string;
	migrationType: 'credentials' | 'backup';
	notes: string;
}
export interface ApiFormData {
	siteAddress: string;
	username: string;
	password: string;
	backupFileLocation: string;
	notes: string;
	howToAccessSite: 'credentials' | 'backup';
}

export interface ApiError {
	code: string;
	message: string;
	data: {
		params?: Record< string, string >;
	};
}
