import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';
import {
	PreviewLink,
	PreviewLinksResponse,
	SITE_PREVIEW_LINKS_QUERY_KEY,
} from './use-site-preview-links';

interface UseDeleteSitePreviewLinkOptions {
	siteId: SiteId;
	onSuccess?: () => void;
	onError?: () => void;
}

export const useDeleteSitePreviewLink = ( options: UseDeleteSitePreviewLinkOptions ) => {
	const { siteId, onSuccess, onError } = options;
	const queryKey = [ SITE_PREVIEW_LINKS_QUERY_KEY, siteId ];
	const queryClient = useQueryClient();
	const deleteLinkMutation = useMutation( {
		mutationFn: ( code: string ) =>
			wpcom.req.post( {
				method: 'DELETE',
				path: `/sites/${ siteId }/preview-links/${ code }`,
				apiNamespace: 'wpcom/v2',
			} ),
		onSuccess: () => {
			onSuccess?.();
		},
		onMutate: async ( code: string ) => {
			await queryClient.cancelQueries( {
				queryKey,
			} );
			const cachedData = queryClient.getQueryData< PreviewLinksResponse >( queryKey );
			queryClient.setQueryData< PreviewLinksResponse >( queryKey, ( old ) => {
				const previewLinks = old ?? [];
				// Inform the UI the link is being removed
				const index = previewLinks.findIndex( ( previewLink ) => previewLink.code === code );
				if ( index >= 0 ) {
					previewLinks[ index ].isRemoving = true;
				}
				return previewLinks;
			} );
			return cachedData;
		},
		onError: ( err, code, context ) => {
			queryClient.setQueryData(
				queryKey,
				context?.map( ( link ) => ( { ...link, isRemoving: false } ) )
			);
			onError?.();
		},
		onSettled: ( data: PreviewLink | undefined ) => {
			if ( data?.code ) {
				const cachedData = queryClient.getQueryData< PreviewLinksResponse >( queryKey );
				queryClient.setQueryData(
					queryKey,
					() => cachedData?.filter( ( previewLink ) => ! previewLink.isRemoving )
				);
			}
			queryClient.invalidateQueries( {
				queryKey,
			} );
		},
	} );

	const { mutate: deleteLink, ...restMutation } = deleteLinkMutation;

	return { deleteLink, ...restMutation };
};
