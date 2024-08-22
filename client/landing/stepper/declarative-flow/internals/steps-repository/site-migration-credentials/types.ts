export interface CredentialsFormData {
	siteAddress: string;
	username: string;
	password: string;
	backupFileLocation: string;
	notes: string;
	howToAccessSite: 'credentials' | 'backup';
}

export interface MigrationError {
	body: {
		code: string;
		message: string;
		data: {
			status: number;
			params?: Record< string, string >;
		};
	};
	status: number;
}
