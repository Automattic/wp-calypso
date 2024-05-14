import {
	useMutation,
	UseMutationOptions,
	UseMutationResult,
	useQueryClient,
} from '@tanstack/react-query';
import { cloneDeep } from 'lodash';
import useUpdateSiteCache from 'calypso/a8c-for-agencies/sections/sites/site-preview-pane/hooks/use-update-site-cache';
import { SiteNote } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import wpcom from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { APIError } from 'calypso/state/partner-portal/types';

interface CreateSiteNoteMutationOptions {
	siteId: number;
	content: string;
}

function mutationCreateSiteNote( {
	agencyId,
	siteId,
	content,
}: CreateSiteNoteMutationOptions & { agencyId?: number } ): Promise< SiteNote > {
	if ( ! siteId ) {
		throw new Error( 'Site ID is required to create a note' );
	}

	return wpcom.req.post( {
		method: 'POST',
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites/${ siteId }/notes`,
		body: {
			content,
		},
	} );
}

export default function useCreateSiteNoteMutation< TContext = unknown >(
	options?: UseMutationOptions< SiteNote, APIError, CreateSiteNoteMutationOptions, TContext >
): UseMutationResult< SiteNote, APIError, CreateSiteNoteMutationOptions, TContext > {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const agencyId = useSelector( getActiveAgencyId );
	const updateSiteCache = useUpdateSiteCache< SiteNote >( ( site, context ) => {
		site.a4a_site_notes.unshift( cloneDeep( context ) );
		return site;
	} );

	return useMutation< SiteNote, APIError, CreateSiteNoteMutationOptions, TContext >( {
		...options,
		mutationFn: ( args ) => mutationCreateSiteNote( { ...args, agencyId } ),
		onError: ( error ) => {
			dispatch( errorNotice( error.message ) );
		},
		onSettled: ( note, error, variables ) => {
			if ( note ) {
				updateSiteCache( variables.siteId, note );
			}
			queryClient.invalidateQueries( { queryKey: [ 'jetpack-agency-dashboard-sites' ] } );
		},
	} );
}
