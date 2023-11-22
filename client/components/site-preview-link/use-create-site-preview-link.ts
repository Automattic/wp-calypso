import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';
import {
	PreviewLink,
	PreviewLinksResponse,
	SITE_PREVIEW_LINKS_QUERY_KEY,
} from './use-site-preview-links';

interface UseCreateSitePreviewLinkOptions {
	siteId: SiteId;
	onSuccess?: () => void;
	onError?: () => void;
}

export const useCreateSitePreviewLink = ( options: UseCreateSitePreviewLinkOptions ) => {
	const { siteId, onSuccess, onError } = options;
	const queryKey = [ SITE_PREVIEW_LINKS_QUERY_KEY, siteId ];
	const queryClient = useQueryClient();
	const createLinkMutation = useMutation( {
		mutationFn: () =>
			wpcom.req.post( {
				path: `/sites/${ siteId }/preview-links`,
				apiNamespace: 'wpcom/v2',
			} ),
		onSuccess: () => {
			onSuccess?.();
		},
		onError: ( err, code, context ) => {
			queryClient.setQueryData( queryKey, context );
			onError?.();
		},
		onMutate: async () => {
			await queryClient.cancelQueries( {
				queryKey,
			} );
			const cachedData = queryClient.getQueryData( queryKey );
			queryClient.setQueryData< PreviewLinksResponse >( queryKey, ( old ) => [
				...( old ?? [] ),
				{
					code: '',
					created_at: '',
					isCreating: true,
				},
			] );
			return cachedData;
		},
		onSettled: ( data: PreviewLink | undefined ) => {
			if ( data?.code ) {
				queryClient.setQueryData( queryKey, () => [ data ] );
			}
			queryClient.invalidateQueries( {
				queryKey,
			} );
		},
	} );

	const { mutate: createLink, ...restMutation } = createLinkMutation;

	return { createLink, ...restMutation };
};
