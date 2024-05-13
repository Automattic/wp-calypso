import {
	useMutation,
	UseMutationOptions,
	UseMutationResult,
	useQueryClient,
} from '@tanstack/react-query';
import { cloneDeep } from 'lodash';
import SiteNote from 'calypso/a8c-for-agencies/types/site-note';
import SiteTag, {
	Site,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import wpcom from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
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
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const agencyId = useSelector( getActiveAgencyId );

	// @todo implement
	const updateCache = ( siteId: number, tags: SiteTag[] ) => {
		queryClient.setQueriesData( { queryKey: [ 'jetpack-agency-dashboard-sites' ] }, ( data ) => {
			const siteIndex = ( data?.sites || [] ).findIndex( ( site ) => site.a4a_site_id === siteId );

			if ( siteIndex === -1 ) {
				return undefined;
			}

			// react-query requires fresh copies so we need to clone the data.
			const newData = cloneDeep( data );
			newData.sites[ siteIndex ].a4a_site_tags = cloneDeep( tags );
			return newData;
		} );
	};

	return useMutation< SiteNote, APIError, CreateSiteNoteMutationOptions, TContext >( {
		...options,
		mutationFn: ( args ) => mutationCreateSiteNote( { ...args, agencyId } ),

		onMutate: async ( { siteId, tags } ) => {
			await queryClient.cancelQueries( { queryKey: [ 'jetpack-agency-dashboard-sites' ] } );
			const siteQueries = queryClient.getQueriesData( {
				queryKey: [ 'jetpack-agency-dashboard-sites' ],
			} );
			const site = siteQueries.map(
				( tuple ) => tuple[ 1 ]?.sites.find( ( site: Site ) => site.a4a_site_id === siteId )
			)?.[ 0 ];
			const oldTags = site?.a4a_site_tags || null;
			const revert = () => {
				if ( oldTags === null ) {
					return;
				}

				updateCache( siteId, oldTags );
			};

			updateCache(
				siteId,
				tags.sort().map( ( label ) => ( { id: 0, slug: '', label } ) )
			);

			return { revert };
		},

		onError: ( error, options, context ) => {
			context?.revert?.();
			dispatch( errorNotice( error.message ) );
		},

		onSettled: () => {
			queryClient.invalidateQueries( { queryKey: [ 'jetpack-agency-dashboard-sites' ] } );
		},
	} );
}
