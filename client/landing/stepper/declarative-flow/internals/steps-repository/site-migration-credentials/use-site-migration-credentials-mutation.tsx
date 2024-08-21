import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { CredentialsFormData } from './types';

interface AutomatedMigrationAPIResponse {
	success: boolean;
}

interface AutomatedMigrationBody {
	migration_type: 'credentials' | 'backup';
	blog_url: string;
	from_url?: string;
	username?: string;
	password?: string;
	backup_file_location?: string;
	notes?: string;
}

export const useSiteMigrationCredentialsMutation = <
	TData = AutomatedMigrationAPIResponse | unknown,
	TError = unknown,
	TContext = unknown,
>(
	options: UseMutationOptions< TData, TError, CredentialsFormData, TContext > = {}
) => {
	const siteSlug = useSiteSlugParam();

	const { mutate, ...rest } = useMutation( {
		mutationFn: ( {
			siteAddress,
			username,
			password,
			notes,
			howToAccessSite,
			backupFileLocation,
		} ) => {
			let body: AutomatedMigrationBody = {
				migration_type: howToAccessSite,
				blog_url: siteSlug ?? '',
				notes,
			};

			if ( howToAccessSite === 'credentials' ) {
				body = {
					...body,
					from_url: siteAddress,
					username,
					password,
				};
			} else {
				// In case of backup, we need to send the backup file location.
				body = {
					...body,
					from_url: backupFileLocation,
				};
			}

			return wpcomRequest( {
				path: `sites/${ siteSlug }/automated-migration`,
				apiNamespace: 'wpcom/v2/',
				apiVersion: '2',
				method: 'POST',
				body,
			} );
		},
		...options,
	} );

	return {
		requestAutomatedMigration: mutate,
		...rest,
	};
};
