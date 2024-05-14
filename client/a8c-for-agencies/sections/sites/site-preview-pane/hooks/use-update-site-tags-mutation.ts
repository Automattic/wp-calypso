import {
	useMutation,
	UseMutationOptions,
	UseMutationResult,
	useQueryClient,
} from '@tanstack/react-query';
import { cloneDeep } from 'lodash';
import useGetSiteCache from 'calypso/a8c-for-agencies/sections/sites/site-preview-pane/hooks/use-get-site-cache';
import useUpdateSiteCache from 'calypso/a8c-for-agencies/sections/sites/site-preview-pane/hooks/use-update-site-cache';
import { SiteTag } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import wpcom from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { APIError } from 'calypso/state/partner-portal/types';

interface UpdateSiteTagsMutationOptions {
	siteId: number;
	tags: string[];
}

interface MutationContext {
	revert: () => void;
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

export default function useUpdateSiteTagsMutation(
	options?: UseMutationOptions<
		SiteTag[],
		APIError,
		UpdateSiteTagsMutationOptions,
		MutationContext
	>
): UseMutationResult< SiteTag[], APIError, UpdateSiteTagsMutationOptions, MutationContext > {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const agencyId = useSelector( getActiveAgencyId );
	const getSiteCache = useGetSiteCache();
	const updateSiteCache = useUpdateSiteCache< SiteTag[] >( ( site, context ) => {
		site.a4a_site_tags = cloneDeep( context );
		return site;
	} );

	return useMutation< SiteTag[], APIError, UpdateSiteTagsMutationOptions, MutationContext >( {
		...options,
		mutationFn: ( args ) => mutationUpdateSiteTags( { ...args, agencyId } ),

		onMutate: async ( { siteId, tags } ) => {
			await queryClient.cancelQueries( { queryKey: [ 'jetpack-agency-dashboard-sites' ] } );
			const site = getSiteCache( siteId );
			const oldTags = site?.a4a_site_tags || null;
			const revert = () => {
				if ( oldTags === null ) {
					return;
				}

				updateSiteCache( siteId, oldTags );
			};

			updateSiteCache(
				siteId,
				tags.sort().map( ( label ) => ( { id: 0, slug: '', label } ) )
			);

			return { revert };
		},

		onError: ( error, _options, context ) => {
			context?.revert?.();
			dispatch( errorNotice( error.message ) );
		},

		onSettled: () => {
			queryClient.invalidateQueries( { queryKey: [ 'jetpack-agency-dashboard-sites' ] } );
		},
	} );
}
