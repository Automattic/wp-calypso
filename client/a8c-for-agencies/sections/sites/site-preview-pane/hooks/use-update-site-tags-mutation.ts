import {
	useMutation,
	UseMutationOptions,
	UseMutationResult,
	useQueryClient,
} from '@tanstack/react-query';
import { cloneDeep } from 'lodash';
import useUpdateSiteCache from 'calypso/a8c-for-agencies/sections/sites/site-preview-pane/hooks/use-update-site-cache';
import SiteTag, {
	Site,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import wpcom from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { APIError } from 'calypso/state/partner-portal/types';

interface UpdateSiteTagsMutationOptions {
	siteId: number;
	tags: string[];
}

function mutationUpdateSiteTags( {
	agencyId,
	siteId,
	tags,
}: UpdateSiteTagsMutationOptions & { agencyId?: number } ): Promise< SiteTag[] > {
	if ( ! siteId ) {
		throw new Error( 'Site ID is required to update tags' );
	}

	return wpcom.req.put( {
		method: 'PUT',
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites/${ siteId }/tags`,
		body: {
			tags,
		},
	} );
}

export default function useUpdateSiteTagsMutation< TContext = unknown >(
	options?: UseMutationOptions< SiteTag[], APIError, UpdateSiteTagsMutationOptions, TContext >
): UseMutationResult< SiteTag[], APIError, UpdateSiteTagsMutationOptions, TContext > {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const agencyId = useSelector( getActiveAgencyId );
	const updateCache = useUpdateSiteCache< SiteTag[] >( ( site, context ) => {
		site.a4a_site_tags = cloneDeep( context );
		return site;
	} );

	/*const updateCache = ( siteId: number, tags: SiteTag[] ) => {
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
	};*/

	return useMutation< SiteTag[], APIError, UpdateSiteTagsMutationOptions, TContext >( {
		...options,
		mutationFn: ( args ) => mutationUpdateSiteTags( { ...args, agencyId } ),

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
