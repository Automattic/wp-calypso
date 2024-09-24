import { Control, FieldErrors } from 'react-hook-form';

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

export interface CredentialsFormFieldProps {
	control: Control< CredentialsFormData >;
	errors?: FieldErrors< CredentialsFormData >;
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
}
