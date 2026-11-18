import { shareSiteMigrationAccess } from '@automattic/api-core';
import { useLocale } from '@automattic/i18n-utils';
import { useMutation } from '@tanstack/react-query';
import { ApiError, CredentialsFormData } from '../types';

interface AutomatedMigrationAPIResponse {
	success: boolean;
}

export const useRequestAutomatedMigration = ( siteSlug?: string | null ) => {
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

			return shareSiteMigrationAccess(
				siteSlug,
				siteSlug,
				locale,
				migrationType === 'credentials'
					? {
							migration_type: migrationType,
							from_url,
							username,
							password,
							notes,
							bypass_verification: bypassVerification,
						}
					: { migration_type: migrationType, from_url: backupFileLocation, notes }
			);
		},
	} );
};
