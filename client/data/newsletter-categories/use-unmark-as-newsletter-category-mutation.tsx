import { useMutation, useQueryClient } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';
import { NewsletterCategories, NewsletterCategory } from './types';
import { getNewsletterCategoriesKey } from './use-newsletter-categories-query';

type UnmarkAsNewsletterCategoryResponse = {
	success: boolean;
};

const useUnmarkAsNewsletterCategoryMutation = ( siteId: string | number ) => {
	const queryClient = useQueryClient();
	const cacheKey = getNewsletterCategoriesKey( siteId );

	return useMutation( {
		mutationFn: async ( categoryId: number ) => {
			if ( ! categoryId ) {
				throw new Error( 'ID is missing.' );
			}

			const response = await request< UnmarkAsNewsletterCategoryResponse >( {
				path: `/sites/${ siteId }/newsletter-categories/${ categoryId }`,
				method: 'DELETE',
				apiVersion: '2',
				apiNamespace: 'wpcom/v2',
			} );

			if ( ! response.success ) {
				throw new Error( 'Something went wrong while unmarking category as newsletter category.' );
			}

			return response;
		},
		onMutate: async ( categoryId: number ) => {
			await queryClient.cancelQueries( { queryKey: cacheKey } );

			const previousData = queryClient.getQueryData< NewsletterCategories >( cacheKey );

			queryClient.setQueryData( cacheKey, ( oldData?: NewsletterCategories ) => {
				const updatedData = {
					enabled: oldData?.enabled || false,
					newsletterCategories:
						oldData?.newsletterCategories.filter(
							( category: NewsletterCategory ) => category?.id !== categoryId
						) || [],
				};

				return updatedData;
			} );

			return { previousData };
		},
		onError: ( error, variables, context ) => {
			queryClient.setQueryData( cacheKey, context?.previousData );
		},
		onSettled: async () => {
			await queryClient.invalidateQueries( { queryKey: cacheKey } );
		},
	} );
};

export default useUnmarkAsNewsletterCategoryMutation;
