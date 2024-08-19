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
		} ) =>
			wpcomRequest( {
				path: 'help/automated-migration',
				apiNamespace: 'wpcom/v2/',
				apiVersion: '2',
				method: 'POST',
				body: {
					migration_type: howToAccessSite,
					from_url: siteAddress,
					username,
					password,
					backup_file_location: backupFileLocation,
					notes,
				},
			} ),
		...options,
	} );

	return {
		requestAutomatedMigration: mutate,
		...rest,
	};
};
