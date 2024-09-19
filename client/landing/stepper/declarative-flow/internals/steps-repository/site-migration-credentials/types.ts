import { Control, FieldErrors } from 'react-hook-form';

export interface CredentialsFormData {
	siteAddress: string;
	username: string;
	password: string;
	backupFileLocation: string;
	notes: string;
	howToAccessSite: 'credentials' | 'backup';
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
	status: number;
}
