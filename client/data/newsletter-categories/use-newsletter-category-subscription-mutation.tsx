import { useMutation, useQueryClient } from '@tanstack/react-query';
import request from 'wpcom-proxy-request';
import { NewsletterCategories } from './types';
import { getNewsletterCategoriesKey } from './use-newsletter-categories-query';
import { getSubscribedNewsletterCategoriesKey } from './use-subscribed-newsletter-categories-query';

type NewsletterCategorySubscription = {
	term_id: number;
	subscribe: boolean;
};

type NewsletterCategorySubscriptionResponse = {
	success: boolean;
};

const useNewsletterCategorySubscriptionMutation = ( siteId: string | number ) => {
	const queryClient = useQueryClient();
	const subscribedCategoriesCacheKey = getSubscribedNewsletterCategoriesKey( siteId );
	const categoriesCacheKey = getNewsletterCategoriesKey( siteId );

	return useMutation( {
		mutationFn: async ( categorySubscriptions: NewsletterCategorySubscription[] ) => {
			return await request< NewsletterCategorySubscriptionResponse >( {
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
			const categories = queryClient.getQueryData< NewsletterCategories >( categoriesCacheKey );

			queryClient.setQueryData(
				subscribedCategoriesCacheKey,
				( oldData?: NewsletterCategories ) => {
					const subscribedCategoryIds = categorySubscriptions
						.filter( ( categorySubscription ) => categorySubscription.subscribe )
						.map( ( categorySubscription ) => categorySubscription.term_id );

					const newSubscribedCategories =
						categories?.newsletterCategories.map( ( category ) => ( {
							...category,
							subscribed: subscribedCategoryIds.includes( category.id ),
						} ) ) || [];

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
		onSettled: () => {
			queryClient.invalidateQueries( subscribedCategoriesCacheKey );
		},
	} );
};

export default useNewsletterCategorySubscriptionMutation;
