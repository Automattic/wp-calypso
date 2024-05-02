import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import SiteNote from 'calypso/a8c-for-agencies/types/site-note';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { APIError } from 'calypso/state/partner-portal/types';

interface CreateSiteNoteMutationOptions {
	siteId: number;
	note: string;
}

function mutationCreateSiteNote( {
	agencyId,
	siteId,
	note,
}: CreateSiteNoteMutationOptions & { agencyId?: number } ): Promise< SiteNote > {
	if ( ! siteId ) {
		throw new Error( 'Site ID is required to create a note' );
	}

	return wpcom.req.post( {
		method: 'POST',
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites/${ siteId }/notes`,
		body: {
			content: note,
		},
	} );
}

export default function useCreateSiteNoteMutation< TContext = unknown >(
	options?: UseMutationOptions< SiteNote, APIError, CreateSiteNoteMutationOptions, TContext >
): UseMutationResult< SiteNote, APIError, CreateSiteNoteMutationOptions, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< SiteNote, APIError, CreateSiteNoteMutationOptions, TContext >( {
		...options,
		mutationFn: ( args ) => mutationCreateSiteNote( { ...args, agencyId } ),
	} );
}
