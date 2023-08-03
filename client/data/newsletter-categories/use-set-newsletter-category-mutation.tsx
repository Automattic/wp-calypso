import { useMutation, useQueryClient } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';

type useSetNewsletterCategoryMutationParams = {
	siteId: number;
};

type SetNewsletterCategoryParams = {
	id: number;
};

type SetNewsletterCategoryResponse = {
	success: boolean;
};

const useSetNewsletterCategoryMutation = ( { siteId }: useSetNewsletterCategoryMutationParams ) => {
	const queryClient = useQueryClient();
	const cacheKey = [ `newsletter-categories-${ siteId }` ];
	return useMutation( {
		mutationFn: async ( { id }: SetNewsletterCategoryParams ) => {
			if ( ! id ) {
				throw new Error( 'ID is missing.' );
			}

			const response = await request< SetNewsletterCategoryResponse >( {
				path: `/sites/${ siteId }/newsletter-categories/${ id }`,
				method: 'POST',
				apiVersion: '2',
				apiNamespace: 'wpcom/v2',
			} );

			if ( ! response.success ) {
				throw new Error( 'Something went wrong while setting category as newsletter category.' );
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

export default useSetNewsletterCategoryMutation;
