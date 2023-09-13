import { useMutation, useQueryClient } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';
import { NewsletterCategories, NewsletterCategoriesResponse } from './types';
import { getSubscribedNewsletterCategoriesKey } from './use-subscribed-newsletter-categories-query';

type NewsletterCategorySubscription = {
	term_id: number;
	subscribe: boolean;
};

const useNewsletterCategorySubscriptionMutation = ( siteId: string | number ) => {
	const queryClient = useQueryClient();
	const subscribedCategoriesCacheKey = getSubscribedNewsletterCategoriesKey( siteId );

	return useMutation( {
		mutationFn: async ( categorySubscriptions: NewsletterCategorySubscription[] ) => {
			return await request< NewsletterCategoriesResponse >( {
				path: `/sites/${ siteId }/newsletter-categories/subscriptions`,
				method: 'POST',
				apiVersion: '2',
				apiNamespace: 'wpcom/v2',
				body: { categories: categorySubscriptions },
			} );
		},
		onMutate: async ( categorySubscriptions: NewsletterCategorySubscription[] ) => {
			await queryClient.cancelQueries( subscribedCategoriesCacheKey );

			const previousData = queryClient.getQueryData< NewsletterCategories >(
				subscribedCategoriesCacheKey
			);

			queryClient.setQueryData(
				subscribedCategoriesCacheKey,
				( oldData?: NewsletterCategories ) => {
					const newSubscribedCategories =
						previousData?.newsletterCategories.map( ( category ) => {
							const categorySubscription = categorySubscriptions.find(
								( subscription ) => subscription.term_id === category.id
							);

							if ( ! categorySubscription ) {
								return category;
							}

							return {
								...category,
								subscribed: categorySubscription.subscribe,
							};
						} ) || [];

					const updatedData = {
						...oldData,
						enabled: oldData?.enabled || false,
						newsletterCategories: newSubscribedCategories,
					};

					return updatedData;
				}
			);

			return { previousData };
		},
		onError: ( error, variables, context ) => {
			queryClient.setQueryData( subscribedCategoriesCacheKey, context?.previousData );
		},
		onSettled: async () => {
			await queryClient.invalidateQueries( subscribedCategoriesCacheKey );
		},
	} );
};

export default useNewsletterCategorySubscriptionMutation;
