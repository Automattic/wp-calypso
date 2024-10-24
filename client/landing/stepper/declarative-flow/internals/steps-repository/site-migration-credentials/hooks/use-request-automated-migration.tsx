import { useLocale } from '@automattic/i18n-utils';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { ApiError, CredentialsFormData } from '../types';

interface AutomatedMigrationAPIResponse {
	success: boolean;
}

interface AutomatedMigration {
	migration_type: 'credentials' | 'backup';
	blog_url: string;
	from_url?: string;
	username?: string;
	password?: string;
	backup_file_location?: string;
	notes?: string;
	bypass_verification?: boolean;
}

const requestAutomatedMigration = async (
	siteSlug: string,
	payload: AutomatedMigration,
	locale: string
): Promise< AutomatedMigrationAPIResponse > => {
	return wpcomRequest( {
		path: `sites/${ siteSlug }/automated-migration?_locale=${ locale }`,
		apiNamespace: 'wpcom/v2/',
		apiVersion: '2',
		method: 'POST',
		body: payload,
	} );
};

export const useRequestAutomatedMigration = (
	siteSlug?: string | null,
	options: UseMutationOptions< AutomatedMigrationAPIResponse, ApiError, CredentialsFormData > = {}
) => {
	const locale = useLocale();
	return useMutation< AutomatedMigrationAPIResponse, ApiError, CredentialsFormData >( {
		mutationFn: ( {
			from_url,
			username,
			password,
			notes,
			migrationType,
			backupFileLocation,
			bypassVerification,
		} ) => {
			if ( ! siteSlug ) {
				throw new Error( 'Site slug is required' );
			}

			let body: AutomatedMigration = {
				migration_type: migrationType,
				blog_url: siteSlug ?? '',
				notes,
			};

			if ( migrationType === 'credentials' ) {
				body = {
					...body,
					from_url,
					username,
					password,
					bypass_verification: bypassVerification,
				};
			} else {
				// In case of backup, we need to send the backup file location.
				body = {
					...body,
					from_url: backupFileLocation,
				};
			}

			return requestAutomatedMigration( siteSlug, body, locale );
		},
		...options,
	} );
};
