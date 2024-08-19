import { useMutation } from '@tanstack/react-query';
import { UseMutationOptions } from '@tanstack/react-query/build/modern';
import wpcomRequest from 'wpcom-proxy-request';

interface AutomatedMigrationAPIResponse {
	success: boolean;
}

interface APIError {
	status: number;
	code: string | null;
	message: string;
}

interface AutomatedMigrationRequest {
	siteAddress: string;
	username: string;
	password: string;
	backupFileLocation: string;
	notes: string;
	howToAccessSite: 'credentials' | 'backup';
}

interface AutomatedMigrationBody {
	migration_type: 'credentials' | 'backup';
	from_url?: string;
	username?: string;
	password?: string;
	backup_file_location?: string;
	notes?: string;
}

export const useRequestAutomatedMigration = <
	TData = AutomatedMigrationAPIResponse | APIError,
	TError = APIError,
	TContext = unknown,
>(
	options: UseMutationOptions< TData, TError, AutomatedMigrationRequest, TContext > = {}
) => {
	const { mutate, ...rest } = useMutation( {
		mutationFn: ( {
			siteAddress,
			username,
			password,
			backupFileLocation,
			notes,
			howToAccessSite,
		} ) => {
			let body: AutomatedMigrationBody = {
				migration_type: howToAccessSite,
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
				// In case of backup, we need to send the backup file location
				body = {
					...body,
					from_url: backupFileLocation,
				};
			}

			return wpcomRequest( {
				path: 'help/automated-migration',
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
