import { useMutation, useQueryClient } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';
import { getNewsletterCategoriesKey } from './use-newsletter-categories-query';

type MarkAsNewsletterCategoryResponse = {
	success: boolean;
};

const useMarkAsNewsletterCategoryMutation = ( siteId: string | number ) => {
	const queryClient = useQueryClient();
	const cacheKey = getNewsletterCategoriesKey( siteId );
	return useMutation( {
		mutationFn: async ( id: number ) => {
			if ( ! id ) {
				throw new Error( 'ID is missing.' );
			}

			const response = await request< MarkAsNewsletterCategoryResponse >( {
				path: `/sites/${ siteId }/newsletter-categories/${ id }`,
				method: 'POST',
				apiVersion: '2',
				apiNamespace: 'wpcom/v2',
			} );

			if ( ! response.success ) {
				throw new Error( 'Something went wrong while marking category as newsletter category.' );
			}

			return response;
		},
		onMutate: async () => {
			await queryClient.cancelQueries( cacheKey );
		},
		onSettled: () => {
			queryClient.invalidateQueries( cacheKey );
		},
	} );
};

export default useMarkAsNewsletterCategoryMutation;
