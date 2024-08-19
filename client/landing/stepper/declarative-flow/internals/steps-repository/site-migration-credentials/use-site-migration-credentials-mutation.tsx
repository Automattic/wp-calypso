import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import wp from 'calypso/lib/wp';
import { CredentialsFormData } from './types';

export const useMigrationCredentialsMutation = () => {
	const siteSlug = useSiteSlugParam();

	const saveCredentialsMutation = useMutation( {
		mutationFn: async ( {
			siteAddress,
			username,
			password,
			notes,
			howToAccessSite,
		}: CredentialsFormData ) => {
			try {
				await wp.req.post( {
					path: `/help/automated-migration`,
					apiNamespace: 'wpcom/v2',
					body: {
						blog_url: siteSlug,
						from_url: siteAddress,
						migration_type: howToAccessSite,
						username,
						password,
						notes,
					},
				} );
			} catch ( error: any ) {
				throw {
					body: {
						code: error.code,
						message: error.message,
						data: error.data,
					},
					status: error.status,
				};
			}
		},
	} );

	const { mutate: saveCredentialsMutate, ...saveCredentialsMutationRest } = saveCredentialsMutation;

	const saveCredentials = useCallback(
		( saveCredentialsOptions: CredentialsFormData ) =>
			saveCredentialsMutation.mutateAsync( saveCredentialsOptions ),
		[ saveCredentialsMutation ]
	);

	return {
		saveCredentials,
		saveCredentialsMutationRest,
	};
};
