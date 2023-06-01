export interface StartImportTrackingProps {
	type: string;
}

export type CredentialsStatus = 'unsubmitted' | 'pending' | 'success' | 'failed';

export type CredentialsProtocol = 'ftp' | 'ssh';
