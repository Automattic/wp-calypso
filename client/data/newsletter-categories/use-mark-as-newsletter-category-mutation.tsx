import { useMutation, useQueryClient } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';
import { Category, NewsletterCategories, NewsletterCategory } from './types';
import { getNewsletterCategoriesKey } from './use-newsletter-categories-query';

type MarkAsNewsletterCategoryResponse = {
	success: boolean;
};

const useMarkAsNewsletterCategoryMutation = ( siteId: string | number ) => {
	const queryClient = useQueryClient();
	const cacheKey = getNewsletterCategoriesKey( siteId );
	return useMutation( {
		mutationFn: async ( categoryId: number ) => {
			if ( ! categoryId ) {
				throw new Error( 'ID is missing.' );
			}

			const response = await request< MarkAsNewsletterCategoryResponse >( {
				path: `/sites/${ siteId }/newsletter-categories/${ categoryId }`,
				method: 'POST',
				apiVersion: '2',
				apiNamespace: 'wpcom/v2',
			} );

			if ( ! response.success ) {
				throw new Error( 'Something went wrong while marking category as newsletter category.' );
			}

			return response;
		},
		onMutate: async ( categoryId: number ) => {
			await queryClient.cancelQueries( { queryKey: cacheKey } );

			const previousData = queryClient.getQueryData< NewsletterCategories >( cacheKey );
			const categories = queryClient.getQueryData< Category[] >( [ 'categories', siteId ] );

			queryClient.setQueryData( cacheKey, ( oldData?: NewsletterCategories ) => {
				const newNewsletterCategory = categories?.find(
					( category ) => category?.id === categoryId
				);

				if ( ! newNewsletterCategory ) {
					return oldData;
				}

				const updatedData = {
					enabled: oldData?.enabled || false,
					newsletterCategories: [
						...( oldData?.newsletterCategories ? oldData.newsletterCategories : [] ),
						newNewsletterCategory as NewsletterCategory,
					],
				};

				return updatedData;
			} );

			return { previousData };
		},
		onError: ( error, variables, context ) => {
			queryClient.setQueryData( cacheKey, context?.previousData );
		},
		onSettled: async () => {
			await queryClient.invalidateQueries( cacheKey );
		},
	} );
};

export default useMarkAsNewsletterCategoryMutation;
