import { useMutation, useQueryClient } from 'react-query';
import wpcom from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';
import { PreviewLinksResponse, SITE_PREVIEW_LINKS_QUERY_KEY } from './use-site-preview-links';

export const useDeleteSitePreviewLink = (
	siteId: SiteId,
	onSuccess?: () => void,
	onError?: () => void
) => {
	const queryKey = [ SITE_PREVIEW_LINKS_QUERY_KEY, siteId ];
	const queryClient = useQueryClient();
	const deleteLinkMutation = useMutation(
		( code: string ) =>
			wpcom.req.post( {
				method: 'DELETE',
				path: `/sites/${ siteId }/preview-links/${ code }`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			onSuccess: () => {
				onSuccess?.();
			},
			onMutate: async ( code: string ) => {
				await queryClient.cancelQueries( queryKey );
				const cachedData = queryClient.getQueryData< PreviewLinksResponse >( queryKey );
				queryClient.setQueryData< PreviewLinksResponse >( queryKey, ( old ) => {
					const previewLinks = old?.preview_links ?? [];
					// Inform the UI the link is being removed
					const index = previewLinks.findIndex( ( previewLink ) => previewLink.code === code );
					if ( index >= 0 ) {
						previewLinks[ index ].isRemoving = true;
					}
					return {
						preview_links: previewLinks,
					};
				} );
				return cachedData;
			},
			onError: ( err, code, context ) => {
				queryClient.setQueryData( queryKey, context );
				onError?.();
			},
			onSettled: ( data ) => {
				queryClient.setQueryData( queryKey, () => data );
				queryClient.invalidateQueries( queryKey );
			},
		}
	);

	const { mutate: deleteLink, ...restMutation } = deleteLinkMutation;

	return { deleteLink, ...restMutation };
};
