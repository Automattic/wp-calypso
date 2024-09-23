import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { AgencyDirectoryApplication } from 'calypso/a8c-for-agencies/sections/partner-directory/types';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { Agency } from 'calypso/state/a8c-for-agencies/types';

interface APIError {
	status: number;
	code: string | null;
	message: string;
	data?: any;
}

function mutationSubmitPartnerDirectoryApplication(
	agencyId: number | undefined,
	application: AgencyDirectoryApplication
): Promise< Agency > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to issue a license' );
	}

	return wpcom.req.put( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/profile/application`,
		method: 'PUT',
		body: {
			services: application.services,
			products: application.products,
			directories: application.directories.map( ( { directory, urls, note } ) => ( {
				directory,
				urls,
				note,
			} ) ),
			feedback_url: application.feedbackUrl,
			is_published: application.isPublished,
		},
	} );
}

export default function useSubmitPartnerDirectoryApplicationMutation< TContext = unknown >(
	options?: UseMutationOptions< Agency, APIError, AgencyDirectoryApplication, TContext >
): UseMutationResult< Agency, APIError, AgencyDirectoryApplication, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< Agency, APIError, AgencyDirectoryApplication, TContext >( {
		...options,
		mutationFn: ( application ) =>
			mutationSubmitPartnerDirectoryApplication( agencyId, application ),
	} );
}
